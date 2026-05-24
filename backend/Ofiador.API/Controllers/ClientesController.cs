using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Application.Services;
using Ofiador.Application.DTOs;
namespace Ofiador.API.Controllers
{
 
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly ClienteService _clienteService;
        private readonly ApplicationDbContext _context;
        public ClienteController(ClienteService clienteService, ApplicationDbContext context) 
        { 
            _clienteService = clienteService;
            _context = context;
        }

        [Authorize]
        [HttpPost]
        public IActionResult CriarCliente([FromBody] ClienteCreateDTOs dtos) 
        {
            var cliente = new Cliente
            {
                Nome = dtos.Nome,

                Cpf_Cnpj = dtos.Cpf_Cnpj,

                Telefone = dtos.Telefone,

                Email = dtos.Email,

                Endereco = dtos.Endereco,

                Limite = dtos.Limite,

                IdEmpresa = dtos.IdEmpresa,
            };
            var resultado= _clienteService.CriarCliente(cliente);

            if (!resultado.sucesso)
            {
                return BadRequest(new
                {
                    erro = resultado.mensagem
                });
            }

            return Created("", cliente);
        }

        [HttpGet]
        public IActionResult ListarClientes()
        {
            var clientes = _context.Clientes.Include( c => c.Empresa)
            .Select(c =>new ClienteDTOs
            {
                IdCliente = c.IdCliente,
                Nome = c.Nome,
                Cpf_Cnpj = c.Cpf_Cnpj,
                Email = c.Email,
                Endereco = c.Endereco,
                Limite = c.Limite,
                Telefone = c.Telefone,
                IdEmpresa = c.IdEmpresa,
                Empresa = c.Empresa !=null ? c.Empresa.Nome : string.Empty,
                Divida = _context.Faturas
                .Where(f => 
                    f.IdCliente== c.IdCliente &&
                    f.Status.ToUpper() != "PAGO").
                    Sum(f => (decimal?)f.Total)??0
            }).ToList();

            return Ok(clientes);
        }
        [HttpGet("{id}/divida")]
            public async Task<IActionResult> GetDivida(int id)
       {
    try
    {
        var divida = await _clienteService.GetDivida(id);

        return Ok(divida);
    }
    catch (Exception ex)
    {
        return NotFound(new
        {
            erro = ex.Message
        });
    }
      }
        [HttpGet("{id}")]
        public IActionResult BuscarClientes(int id)
        {
            var cliente = _context.Clientes
                .Include(c=>c.Empresa)
                .Where(c=>c.IdCliente==id)
                .Select(c=> new ClienteDTOs
                {
                    IdCliente = c.IdCliente,
                    Nome= c.Nome,
                    Cpf_Cnpj = c.Cpf_Cnpj,
                    Email = c.Email,
                    Endereco = c.Endereco,
                    Limite = c.Limite,
                    Telefone = c.Telefone,
                    IdEmpresa = c.IdEmpresa,
                    Empresa = c.Empresa != null
                            ? c.Empresa.Nome
                            : string.Empty,
                }).FirstOrDefault();

            if (cliente == null)
            {
                return NotFound(new
                {
                    erro = "Cliente não encontrado"
                });
            }

            return Ok(cliente);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult AtualizarCliente(int id, [FromBody] ClienteCreateDTOs dtos)
        {
            var cliente = new Cliente
            {
                Nome = dtos.Nome,

                Cpf_Cnpj = dtos.Cpf_Cnpj,

                Telefone = dtos.Telefone,

                Email = dtos.Email,

                Endereco = dtos.Endereco,

                Limite = dtos.Limite,

                IdEmpresa = dtos.IdEmpresa,
            };
            var resultado = _clienteService.AtualizarCliente(id, cliente);

            if (!resultado.sucesso)
            {
                return BadRequest(new
                {
                    erro = resultado.menssagem
                });
            }

            return Ok(new
            {
                mensagem= resultado.menssagem
            });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult ExcluirCliente(int id)
        {
            var resultado = _clienteService.ExcluirCLiente(id);

            if (!resultado.sucesso)
            {
                return NotFound(new
                {
                    erro=resultado.mensagem
                });
            }

            return Ok(new
            {
                mensagem = resultado.mensagem
            });
        }
    }
}