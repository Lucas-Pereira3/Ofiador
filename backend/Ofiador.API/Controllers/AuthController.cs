using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.DTOs;
using Ofiador.Application.Services;


namespace Ofiador.API.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _usuarioService;

        private readonly Jwt _jwt;

        public AuthController(AuthService usuarioService, Jwt jwt)
        {
            _usuarioService = usuarioService;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] AuthDTO dto)
        {
            try
            {
                
                // TENTAR CRIAR O USUÁRIO
                var resultado = _usuarioService.CriarUsuario(dto.Nome, dto.Login, dto.Senha);

                
               
                if (!resultado.sucesso)
                {
                    if (resultado.mensagem.Contains("cadastrado"))
                        return Conflict(new { message = resultado.mensagem });

                    return BadRequest(new { message = resultado.mensagem });
                }
                
                

                return Created("",new
                {
                    resultado.usuario.IdUsuario,
                    resultado.usuario.Nome,
                    resultado.usuario.Login,
                    
                });
            }
            catch (Exception ex)
            {
                // TRATAR O ERRO DE EMAIL DUPLICADO
                if (ex.Message == "Email já cadastrado")
                {
                    return Conflict(new { message = "Este e-mail já está cadastrado" });
                }
                
                // TRATAR O ERRO DE SENHA FRACA
                if (ex.Message.Contains("Senha fraca"))
                {
                    return BadRequest(new { message = ex.Message });
                }

                // OUTROS ERROS
                return StatusCode(500, new { message = "Erro interno no servidor" });
            }
        }
        
        [HttpPost("login")]
        public IActionResult Login([FromBody] AuthDTO dto)
        {
            var usuario = _usuarioService.BuscarPorLogin(dto.Login);

            if (usuario == null)
                return Unauthorized(new { message = "Usuário não encontrado" });

            var senhaValida = _usuarioService.VerificarSenha(dto.Senha, usuario.SenhaHash);

            if (!senhaValida)
                return Unauthorized(new { message = "Senha inválida" });
            
            var token = _jwt.GerarToken(usuario);
            return Ok(new
            {
                usuario.IdUsuario,
                usuario.Nome,
                usuario.Login,
                token 
            });
        }
        //Logout
        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new
            {
                message = "Logout realizado com sucesso"
            });
        }

        //Refresh
        [Authorize]
        [HttpPost("refresh")]
        public IActionResult RefreshToken()
        {
            var email = User.Identity?.Name;

            var usuario = _usuarioService.BuscarPorLogin(email!);

            if(usuario == null)
            {
                return Unauthorized(new{
                    message = "usuario nâo autorizado"
                });
            }

            var novoToken= _jwt.GerarToken(usuario);

            return Ok(new{
                token = novoToken
            });
        }
    }
}