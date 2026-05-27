using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Application.Services;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;

namespace Ofiador.API.Controllers
{
 
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;
        
        public ClienteController(IClienteService clienteService) 
        { 
            _clienteService = clienteService;
           
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
            var cliente = _clienteService.ListarCLientes();

            return Ok(cliente);
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
            var cliente = _clienteService.BuscarClientePorId(id);

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
                if (resultado.mensagem.Contains("faturas"))
                {
                    return Conflict(new
                    {
                        erro = resultado.mensagem
                    });
                }
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