# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY opensas.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "opensas.dll"]
