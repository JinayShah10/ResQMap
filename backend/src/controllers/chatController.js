const { spawn } = require('child_process');
const path = require('path');

exports.getChatResponse = async (req, res) => {
  const { message } = req.body;

  // Validate request parameters
  if (message === undefined || message === null) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      error: "Message must be a string."
    });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage === '') {
    return res.status(400).json({
      error: "Message cannot be empty."
    });
  }

  const pythonPath = path.resolve(__dirname, '../../ai-architecture/venv/bin/python');
  const scriptPath = path.resolve(__dirname, '../../ai-architecture/ai.py');
  const cwdPath = path.resolve(__dirname, '../../ai-architecture');

  try {
    // Spawn Python process with the --api flag
    const child = spawn(pythonPath, [scriptPath, '--api'], {
      cwd: cwdPath,
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.stdin.write(trimmedMessage + '\n');
    child.stdin.end();

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      res.status(504).json({
        success: false,
        message: "AI request timed out."
      });
    }, 30000);

    child.on('close', (code) => {
      clearTimeout(timeout);

      if (res.headersSent) return;

      if (code !== 0) {
        console.error(`Python process exited with code ${code}. Stderr: ${stderr}`);
        return res.status(500).json({
          success: false,
          message: "AI service unavailable."
        });
      }

      const answer = stdout.trim();

      return res.status(200).json({
        success: true,
        answer
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      if (res.headersSent) return;
      console.error(`Failed to start Python process: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: "AI service unavailable."
      });
    });

  } catch (error) {
    console.error(`Unexpected server error in chatController: ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "AI service unavailable."
      });
    }
  }
};
