using Ofiador.Domain.Entities;

namespace Ofiador.API
{
    public interface IJwt
    {
        string GerarToken(Usuario usuario);
    }
}
