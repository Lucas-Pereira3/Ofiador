using System.Text.RegularExpressions;
using Ofiador.Infrastructure.Repository;
using Ofiador.Domain.Entities;
using Ofiador.Application.DTOs;

namespace Ofiador.Application.Services
{
    public class ClienteService
    {
        private readonly ClienteRepository _repository;

        public ClienteService(ClienteRepository repository){
            _repository = repository;
        }
        //Telefone Valido
        public bool TelefoneValido(string telefone)
        {
            //Remover oque não for numero
            telefone = Regex.Replace(telefone, @"[^\d]", "");

            //telefone fixo = 10
            //celular = 11
            if(telefone.Length < 10 || telefone.Length > 11)
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
        //Cnjpj Valido
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

        //validar CPF
        public bool CpfValido(string cpf)
        {
            cpf= Regex.Replace(cpf,@"[^\d]","");

            if(cpf.Length != 11)
                return false;
            
            if(new string(cpf[0], 11)== cpf)
                return false;
            
            int[] multiplicador1= {10,9,8,7,6,5,4,3,2};

            int[] multiplicador2= {11,10,9,8,7,6,5,4,3,2};

            string tempCpf = cpf.Substring(0,9);

            int soma=0;

            for(int i=0; i < 9; i++)
            {
                soma+= int.Parse(tempCpf[i].ToString())*multiplicador1[i];
            }

            int resto= soma % 11;

            resto=resto<2 ? 0 : 11 - resto;

            string digito = resto.ToString();

            tempCpf += digito;

            soma = 0;

            for (int i = 0; i < 10; i++)
            {
                soma += int.Parse(tempCpf[i].ToString()) *
                multiplicador2[i];
            }

            resto = soma % 11;

            resto = resto < 2 ? 0 : 11 - resto;

            digito += resto.ToString();

            return cpf.EndsWith(digito);

        }
        //Email
        public bool EmailValido(string email)
        {
            email = email.Trim();
            var regex = new Regex( @"^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.(com|com\.br|net)$",RegexOptions.IgnoreCase);
            return regex.IsMatch(email);
        }
        //Validar Documento
        public bool DocumentoValido(string documento)
        {
            documento = Regex.Replace(documento,@"[^\d]","");

            if(documento.Length == 11)
            {
                return CpfValido(documento);
            }

            if(documento.Length == 14)
            {
                return CnpjValido(documento);
            }

            return false;
        }
        //Documento Existe
        public bool DocumentoExiste(string documento)
        {
            return _repository.DocumentoExiste(documento);
        }

        //Email Existe
         public bool EmailExiste(string email)
        {
            return _repository.EmailExiste(email);
        }

        //Criar Cliente
        public(bool sucesso, string mensagem)CriarCliente(Cliente cliente){
            cliente.Email = cliente.Email.Trim().ToLower();

            cliente.Cpf_Cnpj = Regex.Replace(cliente.Cpf_Cnpj, @"[^\d]","");

             if (string.IsNullOrWhiteSpace(cliente.Nome))
            {
                return (false, "Nome é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(cliente.Cpf_Cnpj))
            {
                return (false, "CPF/CNPJ é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(cliente.Email))
            {
                return (false, "Email é obrigatório");
            }

            if (string.IsNullOrWhiteSpace(cliente.Telefone))
            {
                return (false, "Telefone é obrigatório");
            }

            if (!TelefoneValido(cliente.Telefone)) 
            {
                return (false, "Telefone inválido");
            }

             if (DocumentoExiste(cliente.Cpf_Cnpj))
            {
                return (false,"Já existe cliente com esse documento");
            }

            if (!EmailValido(cliente.Email))
            {
                return (false,"Email inválido");
            }

            if (EmailExiste(cliente.Email))
            {
                return(false,"Email já cadastrado");
            }

            if (!DocumentoValido(cliente.Cpf_Cnpj))
            {
                return (false,"CPF/CNPJ inválido");
            }
            
            if(cliente.Limite <= 0)
            {
                return(false,"Limite é obrigatório");
            }

            if(cliente.Endereco == null)
            {
                return(false,"Endereço é obrigatório");
            }
            

            if (!_repository.EmpresaExiste(cliente.IdEmpresa))
            {
                return(false,"empresa não encontrada");
            }

            _repository.Adicionar(cliente);

            return(true, "Cliente cadastrado com sucesso");
        }

        public (bool sucesso, string menssagem)AtualizarCliente(int id, Cliente clienteAtualizado)
        {
            var cliente = _repository.BuscarPorId(id);

            if(cliente == null)
            {
                return(false,"Cliente não encontrado");
            }

            clienteAtualizado.Email=clienteAtualizado.Email.Trim().ToLower();

            clienteAtualizado.Cpf_Cnpj= Regex.Replace(clienteAtualizado.Cpf_Cnpj, @"[^\d]","");

            //documento duplicado

            var documentoExiste = _repository.DocumentoAtualizadoExiste(clienteAtualizado.Cpf_Cnpj, id);

            if (documentoExiste)
            {
                return(false,"Documento já cadastrado");
            }

            //Email duplicado

            var EmailExiste = _repository.EmailAtualizadoExiste(clienteAtualizado.Email, id);

            if (EmailExiste)
            {
                return(false,"Email já cadastradoo");
            }
            //Limite não nulo
            if(clienteAtualizado.Limite <= 0)
            {
                return(false,"Limite de crédito é Obrigatório");
            }
            //Endereço obrigatório
            if(clienteAtualizado.Endereco == null)
            {
                return(false,"O Endereco é obrigatório");
            }
            //validar Documento
            if (!DocumentoValido(clienteAtualizado.Cpf_Cnpj))
            {
                return(false,"CPF/CNPJ Invalido");
            }
            //validar telefone
            if (!TelefoneValido(clienteAtualizado.Telefone))
            {
                return (false, "Telefone invalida");
            }
            //validar Email
            if (!EmailValido(clienteAtualizado.Email))
            {
                return(false,"Email invalido");
            }

            //atualizar dados
            cliente.Nome = clienteAtualizado.Nome;
            cliente.Cpf_Cnpj=clienteAtualizado.Cpf_Cnpj;
            cliente.Email=clienteAtualizado.Email;

            cliente.Limite= clienteAtualizado.Limite;
            cliente.Telefone=clienteAtualizado.Telefone;
            cliente.IdEmpresa=clienteAtualizado.IdEmpresa;

            _repository.Atualizar();

            return(true,"Cliente atualizadocom Sucesso");
        }

        public(bool sucesso, string mensagem)ExcluirCLiente(int id)
        {
            var cliente = _repository.BuscarPorId(id);

            if(cliente == null)
            {
                return (false, "cliente não encontrado");
            }

            _repository.Remover(cliente);

            return (true,"Cliente excluido com sucesso");
        }
        public async Task<DividaClienteDto> GetDivida(int id)
{
    var cliente = await _repository.GetClienteComFaturas(id);

    if (cliente == null)
    {
        throw new Exception("Cliente não encontrado");
    }

    var parcelas = cliente.Faturas
        .SelectMany(f => f.CompraParcelas);

    var total = parcelas.Sum(p => p.ValorParcela);

    var pago = parcelas
        .Where(p => p.Pago)
        .Sum(p => p.ValorParcela);

    return new DividaClienteDto
    {
        TotalDivida = total - pago
    };
}
    }
}