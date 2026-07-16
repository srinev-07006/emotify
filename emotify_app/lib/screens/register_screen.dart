import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'camera_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _register() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await AuthService.register(_nameCtrl.text.trim(), _emailCtrl.text.trim(), _passCtrl.text);
      if (res.containsKey('token')) {
        await AuthService.saveToken(res['token']);
        if (mounted) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const CameraScreen()));
        }
      } else {
        setState(() => _error = res['error'] ?? 'Registration failed');
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
      appBar: AppBar(backgroundColor: Colors.transparent, foregroundColor: Colors.white),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Create Account', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Join Emotify', style: TextStyle(color: Colors.white54)),
              const SizedBox(height: 48),
              TextField(
                controller: _nameCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(hintText: 'Full Name', hintStyle: TextStyle(color: Colors.white38)),
              ),
              const SizedBox(height: 16),
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
                  : ElevatedButton(onPressed: _register, child: const Text('Register')),
            ],
          ),
        ),
      ),
    );
  }
}