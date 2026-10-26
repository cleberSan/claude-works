---
resumo: Result Pattern (Result, Result<T>, Error, ErrorType) e conversão para ProblemDetails RFC 9457 com código estável, como no CareFlow.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/tree/main/src/BuildingBlocks/CareFlow.BuildingBlocks/Results
  - https://github.com/cleberSan/careflow/blob/main/src/BuildingBlocks/CareFlow.BuildingBlocks.AspNetCore/Http/ErrorHttpExtensions.cs
---

# Result Pattern e ProblemDetails

Erro de negócio é valor, não exception. A borda HTTP escolhe o status pelo tipo do erro e expõe um código estável.

## Tipos (recorte)

```csharp
public enum ErrorType
{
    None = 0, Failure, Validation, NotFound, Conflict, Unauthorized, Forbidden,
    PreconditionFailed, PreconditionRequired,
    Gone, // existiu e foi eliminado de propósito
}

/// Mensagens não devem conter dados pessoais: podem chegar a logs e respostas HTTP.
public sealed record Error
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);
    private Error(string code, string message, ErrorType type) { Code = code; Message = message; Type = type; }
    public string Code { get; }
    public string Message { get; }
    public ErrorType Type { get; }

    public static Error Validation(string code, string message) => Create(code, message, ErrorType.Validation);
    public static Error NotFound(string code, string message) => Create(code, message, ErrorType.NotFound);
    public static Error Conflict(string code, string message) => Create(code, message, ErrorType.Conflict);
    // ... Failure, Unauthorized, Forbidden, PreconditionFailed, PreconditionRequired, Gone

    private static Error Create(string code, string message, ErrorType type)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(message);
        return new Error(code, message, type);
    }
}
```

```csharp
public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        ArgumentNullException.ThrowIfNull(error);
        if (isSuccess && error != Error.None) throw new ArgumentException("Um resultado de sucesso não pode carregar erro.", nameof(error));
        if (!isSuccess && error == Error.None) throw new ArgumentException("Um resultado de falha precisa de um erro.", nameof(error));
        IsSuccess = isSuccess;
        Error = error;
    }
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }
    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<T> Success<T>(T value) => Result<T>.Success(value);
    public static Result<T> Failure<T>(Error error) => Result<T>.Failure(error);
}

public sealed class Result<TValue> : Result
{
    private readonly TValue? _value;
    private Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error) => _value = value;

    // Ler o valor de uma falha é bug: lança.
    public TValue Value => IsSuccess ? _value! : throw new InvalidOperationException("Não é possível ler o valor de um resultado de falha.");

    internal static Result<TValue> Success(TValue value) =>
        value is null ? throw new ArgumentNullException(nameof(value), "Use um Error.NotFound em vez de sucesso com valor nulo.")
                      : new(value, true, Error.None);
    internal static new Result<TValue> Failure(Error error) => new(default, false, error);

    public TOut Match<TOut>(Func<TValue, TOut> onSuccess, Func<Error, TOut> onFailure) =>
        IsSuccess ? onSuccess(_value!) : onFailure(Error);

    public static implicit operator Result<TValue>(TValue value) => Success(value);
    public static implicit operator Result<TValue>(Error error) => Failure(error);
}
```

## Borda HTTP

```csharp
public static ProblemHttpResult ToProblem(this Error error)
{
    var status = StatusCodeFor(error.Type);
    return TypedResults.Problem(
        statusCode: status,
        title: ReasonPhrases.GetReasonPhrase(status),
        detail: error.Message,
        extensions: new Dictionary<string, object?> { ["code"] = error.Code });
}

public static int StatusCodeFor(ErrorType type) => type switch
{
    ErrorType.Validation => 400, ErrorType.Unauthorized => 401, ErrorType.Forbidden => 403,
    ErrorType.NotFound => 404, ErrorType.Conflict => 409, ErrorType.PreconditionFailed => 412,
    ErrorType.PreconditionRequired => 428, ErrorType.Gone => 410, _ => 500,
};
```

## Erros do domínio

```csharp
public static class AppointmentErrors
{
    public static readonly Error SlotUnavailable =
        Error.Conflict("Agenda.HorarioIndisponivel", "O profissional já tem uma consulta nesse horário.");
    public static readonly Error StartsInThePast =
        Error.Validation("Agenda.InicioNoPassado", "Não é possível agendar no passado.");
}
```

## Uso no endpoint

```csharp
public static async Task<Results<Created<AppointmentResponse>, ProblemHttpResult>> HandleAsync(/* ... */)
{
    var result = await handler.HandleAsync(request, key.Value, actor, ct);
    if (result.IsFailure) return result.Error.ToProblem();
    return TypedResults.Created($"/v1/appointments/{result.Value.Id}", AppointmentResponse.From(result.Value));
}
```

O retorno `Results<..., ProblemHttpResult>` deixa os dois caminhos tipados no OpenAPI. Exemplo completo em [idempotencia.md](idempotencia.md).

## Por quê

- Fluxo explícito na assinatura; nada de exception cara para regra de negócio.
- Código estável (`Contexto.Motivo`) para o cliente tratar sem depender do texto.
- Testes de unidade comparam `Error` por igualdade (record).
- Ver [apis/padroes-http.md](../../apis/padroes-http.md) para a tabela de status.
