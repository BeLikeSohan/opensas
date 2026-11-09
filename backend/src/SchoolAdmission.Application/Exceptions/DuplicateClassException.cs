namespace SchoolAdmission.Application.Exceptions;

public sealed class DuplicateClassException(string name)
    : Exception($"A class named '{name}' already exists.");
