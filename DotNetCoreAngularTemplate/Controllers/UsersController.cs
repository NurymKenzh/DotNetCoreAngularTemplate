using DotNetCoreAngularTemplate.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DotNetCoreAngularTemplate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public UsersController(UserManager<ApplicationUser> userManager,
            ApplicationDbContext applicationDbContext)
        {
            _userManager = userManager;
            _context = applicationDbContext;
        }

        public class ApplicationUserRegisterModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long", MinimumLength = 4)]
            [DataType(DataType.Password)]
            public string Password { get; set; }
        }

        // POST: api/Users/Register
        [HttpPost]
        [Route("Register")]
        public async Task<Object> Register(ApplicationUserRegisterModel model)
        {
            var applicationUser = new ApplicationUser()
            {
                UserName = model.Email,
                Email = model.Email
            };

            try
            {
                var result = await _userManager.CreateAsync(applicationUser, model.Password);
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public class ApplicationUserLoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // POST: api/Users/Login
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login(ApplicationUserLoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if(user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                List<Claim> claims = new List<Claim>();
                claims.Add(new Claim("Id", user.Id.ToString()));
                claims.Add(new Claim("Email", user.Email));
                var roles = await _userManager.GetRolesAsync(user);
                IdentityOptions identityOptions = new IdentityOptions();
                foreach(string role in roles)
                {
                    claims.Add(new Claim(identityOptions.ClaimsIdentity.RoleClaimType, role));
                }
                var securityTokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims.ToArray()),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Startup.Configuration["JWTkey"].ToString())),
                    SecurityAlgorithms.HmacSha256Signature)
                };
                var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
                var securityToken = jwtSecurityTokenHandler.CreateToken(securityTokenDescriptor);
                var token = jwtSecurityTokenHandler.WriteToken(securityToken);
                return Ok(new { token });
            }
            else
            {
                return BadRequest(new { message = "Invalid login attempt." });
            }
        }

        // GET: api/Users/GetAuthorizedUserInfo
        [HttpGet]
        [Authorize]
        [Route("GetAuthorizedUserInfo")]
        public async Task<Object> GetAuthorizedUserInfo()
        {
            string userId = User.Claims.First(c => c.Type == "Id").Value;
            var user = await _userManager.FindByIdAsync(userId);
            return new
            {
                user.Email
            };
        }

        public class ApplicationUserViewModel
        {
            public string Id { get; set; }
            public string Email { get; set; }
            public string[] Roles { get; set; }
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<ApplicationUserViewModel>>> Users()
        {
            List<ApplicationUserViewModel> applicationUserViewModels = new List<ApplicationUserViewModel>();
            List<ApplicationUser> applicationUsers = await _context.Users.ToListAsync();
            foreach(ApplicationUser applicationUser in applicationUsers)
            {
                applicationUserViewModels.Add(new ApplicationUserViewModel()
                {
                    Id = applicationUser.Id,
                    Email = applicationUser.Email,
                    Roles = _userManager.GetRolesAsync(applicationUser).Result.ToArray()
                });
            }
            return applicationUserViewModels;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApplicationUserViewModel>> GetUser(string id)
        {
            var applicationUser = await _context.Users.FindAsync(id);
            if(applicationUser == null)
            {
                return NotFound();
            }

            ApplicationUserViewModel applicationUserViewModel = new ApplicationUserViewModel()
            {
                Id = applicationUser.Id,
                Email = applicationUser.Email,
                Roles = _userManager.GetRolesAsync(applicationUser).Result.ToArray()
            };

            return applicationUserViewModel;
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApplicationUserViewModel>> DeleteUser(string id)
        {
            var applicationUser = await _context.Users.FindAsync(id);
            if (applicationUser == null)
            {
                return NotFound();
            }

            _context.Users.Remove(applicationUser);
            await _context.SaveChangesAsync();

            return new ApplicationUserViewModel()
            {
                Id = applicationUser.Id,
                Email = applicationUser.Email,
                Roles = _userManager.GetRolesAsync(applicationUser).Result.ToArray()
            };
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult> PutUser(string id, ApplicationUserViewModel model)
        {
            if(id!=model.Id)
            {
                return BadRequest();
            }

            var applicationUser = await _context.Users.FindAsync(id);
            if (applicationUser == null)
            {
                return NotFound();
            }
            _context.Entry(applicationUser).State = EntityState.Modified;

            try
            {
                var userRoles = await _userManager.GetRolesAsync(applicationUser);
                await _userManager.RemoveFromRolesAsync(applicationUser, userRoles.ToArray());
                await _userManager.AddToRolesAsync(applicationUser, model.Roles);
                await _context.SaveChangesAsync();
            }
            catch(DbUpdateConcurrencyException)
            {
                if(applicationUser == null)
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // GET: api/Users/GetRoles
        [HttpGet]
        [Route("GetRoles")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<IdentityRole>>> GetRoles()
        {
            return await _context.Roles.ToListAsync();
        }
    }
}
