/* Web Crypto key stretching. Password text never enters Sheets, URLs, logs or API payloads. */
(function(root){
 const isAccessCode=value=>/^[a-f0-9]{64}$/.test(value);
 function validate(password,confirmation){if(password!==confirmation)throw new Error('The new passwords do not match.');if(password.length<12||password.length>128)throw new Error('Use a password between 12 and 128 characters.');if(password.trim()!==password)throw new Error('Do not start or end your password with spaces.');if(isAccessCode(password))throw new Error('Choose a password rather than a 64-character access code.');}
 async function proof(userId,password,salt,site){if(!root.crypto?.subtle)throw new Error('Password sign-in requires a secure browser connection.');const encode=new TextEncoder();const key=await root.crypto.subtle.importKey('raw',encode.encode(password),'PBKDF2',false,['deriveBits']);const bits=await root.crypto.subtle.deriveBits({name:'PBKDF2',salt:encode.encode('vietnam-together:password:v1:'+site+':'+userId+':'+salt),iterations:600000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits),n=>n.toString(16).padStart(2,'0')).join('');}
 const api={isAccessCode,validate,proof};if(typeof module==='object'&&module.exports)module.exports=api;else root.TripPasswords=api;
})(typeof window==='object'?window:globalThis);
