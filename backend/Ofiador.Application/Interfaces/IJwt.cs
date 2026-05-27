using Ofiador.Domain.Entities;

namespace Ofiador.Application.Interfaces
{
    public interface IJwt
    {
        string GerarToken(Usuario usuario);
    }
}
