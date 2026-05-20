using System.Text.RegularExpressions;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Repository;

namespace Ofiador.Application.Services{
public class EmpresaService
{
        private readonly EmpresaRepository _repositort;

    public EmpresaService(EmpresaRepository repository)
    {
        _repositort = repository;
    }
        //Telefone Valido
        public bool TelefoneValido(string telefone)
        {
            //Remover oque não for numero
            telefone = Regex.Replace(telefone, @"[^\d]", "");

            //telefone fixo = 10
            //celular = 11
            if (telefone.Length < 10 || telefone.Length > 11)
            {
                return false;
            }

            //impede sequencia repetida
            if (new string(telefone[0], telefone.Length) == telefone)
            {
                return false;
            }

            return true;
        }
        //Validação do Cnpj
        public bool CnpjValido(string cnpj)
    {
        cnpj = Regex.Replace(cnpj,@"[^\d]","");

        if(cnpj.Length != 14)
            return false;

        //Impedir sequencia repetida
        if(new string(cnpj[0], 14)==cnpj)
            return false;

        int[] multiplicador1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] multiplicador2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        string tempCnpj = cnpj.Substring(0,12);

        int soma =0;

        for (int i =0; i<12; i++)
            soma += int.Parse(tempCnpj[i].ToString())*multiplicador1[i];
        int resto = soma % 11;

        resto = resto < 2 ? 0 : 11 - resto;

        string digito = resto.ToString();

        tempCnpj += digito;

        soma = 0;

        for (int i =0; i < 13; i++)
            soma += int.Parse(tempCnpj[i].ToString())*multiplicador2[i];
        
        resto = soma % 11;

        resto = resto < 2 ? 0 : 11 - resto;

        digito += resto.ToString();

        return cnpj.EndsWith(digito);
    }

    //Cnpj Existente
    public bool cnpjExiste(string cnpj)
    {
            return _repositort.CnpjExiste(cnpj);
    }

    //Validação de Email
     public bool EmailValido(string email)
        {
            email = email.Trim();
            var regex = new Regex( @"^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.(com|com\.br|net)$",RegexOptions.IgnoreCase);
            return regex.IsMatch(email);
        }
    
    // VERIFICAR SE EMAIL JÁ EXISTE
        public bool EmailExiste(string email)
        {
            return _repositort.EmailExiste(email);
        }
    public (bool sucesso, string mensagem) CriarEmpresa(Empresa empresa)
    {
        empresa.Email = empresa.Email.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(empresa.Nome))
            {
                return (false, "Nome é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(empresa.Cnpj))
            {
                return (false, "CNPJ é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(empresa.Email))
            {
                return (false, "Email é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(empresa.Telefone))
            {
                return (false, "Telefone é obrigatório");
            }

            if (!TelefoneValido(empresa.Telefone))
            {
                return (false, "Telefone inválido");
            }
            if (!EmailValido(empresa.Email))
            {
                return (false,"Email inválido");
            }

            if (EmailExiste(empresa.Email))
            {
                return(false,"Email já cadastrado");
            }
            empresa.Cnpj = Regex.Replace(
                empresa.Cnpj, @"[^\d]",""
            );

        if (!CnpjValido(empresa.Cnpj))
        {
            return(false,"CNPJ inválido");
        }

        var existe = _repositort.CnpjExiste(empresa.Cnpj);

        if (existe)
        {
            return(false,"já eciste uma empresa com esse Cnpj");
        }

            _repositort.Adicionar(empresa);

        return (true, "empresa cadastrada com sucesso");
    }
}
}