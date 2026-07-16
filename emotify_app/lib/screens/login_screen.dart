import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'register_screen.dart';
import 'camera_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await AuthService.login(_emailCtrl.text.trim(), _passCtrl.text);
      if (res.containsKey('token')) {
        await AuthService.saveToken(res['token']);
        if (mounted) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const CameraScreen()));
        }
      } else {
        setState(() => _error = res['error'] ?? 'Login failed');
      }
    } catch (e) {
      setState(() => _error = 'Could not connect to server');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('EMOTIFY', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF6C63FF))),
              const SizedBox(height: 8),
              const Text('Sign in to continue', style: TextStyle(color: Colors.white54, fontSize: 16)),
              const SizedBox(height: 48),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(hintText: 'Email', hintStyle: TextStyle(color: Colors.white38)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passCtrl,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(hintText: 'Password', hintStyle: TextStyle(color: Colors.white38)),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.redAccent)),
              ],
              const SizedBox(height: 24),
              _loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
                  : ElevatedButton(onPressed: _login, child: const Text('Sign In')),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                  child: const Text("Don't have an account? Register", style: TextStyle(color: Color(0xFF6C63FF))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}