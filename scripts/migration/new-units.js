// Units 13-17: fill the gaps between the original 12 units and the full
// Texas Computer Science I TEKS (62 student expectations).
module.exports = [
{
 id: "u13", title: "Hardware & Programming Languages",
 blurb: "CPU, memory, compilers vs. interpreters, and the limits of numbers.",
 lesson: [
  { h: "Inside the computer", p: "The <mark>CPU</mark> (central processing unit) runs instructions. <mark>Primary memory</mark> (RAM) holds the program and data while it runs and is erased when power is off. <mark>Secondary storage</mark> (SSD, hard drive, flash drive) keeps files when the power is off. <mark>Peripherals</mark> are input and output devices like the keyboard, mouse, monitor, and printer." },
  { h: "High-level languages", p: "People write code in high-level languages such as Python and Java. The computer only runs <mark>machine code</mark> (binary instructions), so the code must be translated.",
    list: ["A <mark>compiler</mark> translates the whole program before it runs. Java is compiled to bytecode, which the Java Virtual Machine runs.", "An <mark>interpreter</mark> translates and runs the program line by line. Python is usually run by an interpreter.", "Compiled programs catch many errors before running. Interpreted programs are quick to test and change."] },
  { h: "Typed languages", p: "In a <mark>strongly, statically typed</mark> language like Java, every variable has a declared type that cannot change. In a <mark>dynamically typed</mark> language like Python, a variable's type comes from the value stored in it and can change.",
    code: { py: "x = 5        # x holds an int\nx = \"five\"   # now x holds a str. Python allows this", java: "int x = 5;\nx = \"five\";  // compile error: incompatible types" } },
  { h: "Local and global variables", p: "A <mark>local variable</mark> is created inside a function and exists only there. A <mark>global variable</mark> is created outside all functions and can be read anywhere in the file. Prefer local variables and parameters, because globals make bugs harder to find.",
    code: { py: "count = 0          # global\n\ndef show():\n    msg = \"hi\"     # local to show()\n    print(msg, count)", java: "public class Demo {\n    static int count = 0;     // class-level (global-like)\n\n    public static void show() {\n        String msg = \"hi\";   // local to show()\n        System.out.println(msg + count);\n    }\n}" } },
  { h: "Numbers have limits", p: { py: "Python integers can grow as large as memory allows, but decimals (floats) are stored in binary and can't be exact. <code>0.1 + 0.2</code> prints <code>0.30000000000000004</code>.", java: "A Java <code>int</code> is 32 bits, so its largest value is 2,147,483,647. Adding 1 wraps around to -2,147,483,648. This is <mark>integer overflow</mark>. Doubles are stored in binary and can't be exact: <code>0.1 + 0.2</code> prints <code>0.30000000000000004</code>." },
    code: { py: "print(0.1 + 0.2)          # 0.30000000000000004\nprint(round(0.1 + 0.2, 2)) # 0.3", java: "int big = Integer.MAX_VALUE;   // 2147483647\nSystem.out.println(big + 1);   // -2147483648 (wraparound)\nSystem.out.println(0.1 + 0.2); // 0.30000000000000004" },
    after: "Never compare decimals with == when exact money or measurements matter. Round, or check whether the difference is very small." },
  { h: "Primitives and objects", p: "A <mark>primitive</mark> variable stores a simple value directly, like a whole number or true/false. An <mark>object</mark> variable refers to a bundle of data and methods, like a String or a list. In Java, <code>int</code>, <code>double</code>, and <code>boolean</code> are primitives while <code>String</code> is an object. In Python, every value is an object." }
 ],
 terms: [["CPU", "The processor that carries out program instructions"], ["Primary memory (RAM)", "Fast, temporary memory that holds running programs and data"], ["Secondary storage", "Long-term storage that keeps files with the power off"], ["Peripheral", "An input or output device connected to the computer"], ["Compiler", "Translates a whole program before it runs"], ["Interpreter", "Translates and runs a program one line at a time"], ["Integer overflow", "When a number is too big for its type and wraps around"], ["Global variable", "A variable declared outside every function"]],
 qs: [
  { id: "u13q1", q: "Which component carries out a program's instructions?", c: ["RAM", "CPU", "SSD", "Monitor"], a: 1, e: "The CPU (central processing unit) executes instructions." },
  { id: "u13q2", q: "You save an essay and turn the computer off. Where does the file stay?", c: ["RAM (primary memory)", "Secondary storage like an SSD", "The CPU", "The keyboard"], a: 1, e: "RAM is erased without power. Secondary storage keeps files." },
  { id: "u13q3", q: "Which device is a peripheral?", c: ["CPU", "RAM", "Printer", "Motherboard"], a: 2, e: "Peripherals are input/output devices outside the core system, like printers and mice." },
  { id: "u13q4", q: "What does an interpreter do?", c: ["Translates the whole program before running it", "Translates and runs the program line by line", "Stores files permanently", "Converts images to binary"], a: 1, e: "An interpreter works line by line. A compiler translates the whole program first." },
  { id: "u13q5", q: { py: "In Python, x = 5 and then x = \"five\" is allowed. Why?", java: "In Java, int x = 5; x = \"five\"; causes an error. Why?" }, c: { py: ["Python is dynamically typed", "Python has no variables", "Strings and ints are the same", "Python is compiled"], java: ["Java is strongly, statically typed", "Java has no strings", "x is a constant", "Java is interpreted"] }, a: 0, e: { py: "In a dynamically typed language, a variable takes the type of whatever value it holds.", java: "A Java variable's declared type can't change, so an int variable can't hold a String." } },
  { id: "u13q6", q: "What is printed?", code: { py: "print(0.1 + 0.2 == 0.3)", java: "System.out.println(0.1 + 0.2 == 0.3);" }, c: { py: ["True", "False", "Error", "0.3"], java: ["true", "false", "Error", "0.3"] }, a: 1, e: "Decimals are stored in binary and aren't exact, so 0.1 + 0.2 is 0.30000000000000004." },
  { id: "u13q7", q: { py: "Which is true about integers in Python?", java: "What is Integer.MAX_VALUE + 1 in Java?" }, c: { py: ["They overflow at 2,147,483,647", "They can grow as large as memory allows", "They are always 8 bits", "They can't be negative"], java: ["2147483648", "-2147483648", "An error", "0"] }, a: 1, e: { py: "Python ints have no fixed size, so they don't wrap around.", java: "A 32-bit int wraps around from the largest value to the smallest. That's integer overflow." } },
  { id: "u13q8", q: "A variable created inside a function is called:", c: ["Global", "Local", "Constant", "Static"], a: 1, e: "Local variables exist only inside the function where they're created." }
 ]
},
{
 id: "u14", title: "Style, Output & Graphics",
 blurb: "Readable code, clear prompts, formatted output, and simple drawings.",
 lesson: [
  { h: "Code that people can read", p: "Programs are read by people far more often than they're written. Good <mark>programming style</mark> makes code easier to read, fix, and grade.",
    list: ["Use <mark>descriptive identifiers</mark>: <code>total_price</code> or <code>totalPrice</code>, not <code>tp</code>.", "Add <mark>comments</mark> to explain why, not what every line does.", "Use consistent <mark>indentation</mark> and white space between sections.", "Follow your language's standard style (PEP 8 for Python, Java conventions for Java)."] },
  { h: "Prompts and labeled output", p: "When a program asks for input, the prompt should tell the user exactly what to type. Output should be labeled so the user knows what each number means.",
    code: { py: "# Ask clearly, label the result\nname = input(\"Enter your first name: \")\nage = int(input(\"Enter your age in years: \"))\nprint(\"Name:\", name)\nprint(\"Age next year:\", age + 1)", java: "// Ask clearly, label the result\nScanner in = new Scanner(System.in);\nSystem.out.print(\"Enter your first name: \");\nString name = in.nextLine();\nSystem.out.print(\"Enter your age in years: \");\nint age = in.nextInt();\nSystem.out.println(\"Name: \" + name);\nSystem.out.println(\"Age next year: \" + (age + 1));" } },
  { h: "Formatting numbers", p: "Money and measurements should show a fixed number of decimal places, and tables should line up in columns.",
    code: { py: "price = 4.5\nprint(f\"Total: ${price:.2f}\")       # Total: $4.50\nprint(f\"{'Item':<8}{'Cost':>8}\")\nprint(f\"{'Taco':<8}{3.25:>8.2f}\")", java: "double price = 4.5;\nSystem.out.printf(\"Total: $%.2f%n\", price);   // Total: $4.50\nSystem.out.printf(\"%-8s%8s%n\", \"Item\", \"Cost\");\nSystem.out.printf(\"%-8s%8.2f%n\", \"Taco\", 3.25);" },
    after: { py: "Inside an f-string, :.2f means two decimal places, < means left-align, and > means right-align.", java: "In printf, %.2f means two decimal places, %-8s left-aligns in 8 spaces, and %n starts a new line." } },
  { h: "Simple vector graphics", p: "<mark>Vector graphics</mark> are drawn from shapes defined by coordinates, like lines, circles, and rectangles, instead of a grid of pixels.",
    code: { py: "import turtle\nt = turtle.Turtle()\n\nt.forward(100)          # a line 100 pixels long\nt.circle(50)            # a circle with radius 50\nfor side in range(4):   # a 100 x 60 rectangle\n    t.forward(100 if side % 2 == 0 else 60)\n    t.left(90)\nturtle.done()", java: "import java.awt.*;\nimport javax.swing.*;\n\npublic class Shapes extends JPanel {\n    protected void paintComponent(Graphics g) {\n        super.paintComponent(g);\n        g.drawLine(10, 10, 110, 10);   // line\n        g.drawOval(10, 30, 100, 100);  // circle\n        g.drawRect(130, 30, 100, 60);  // rectangle\n    }\n}" },
    after: { py: "In turtle, forward moves and draws, left turns in degrees, and circle draws using a radius.", java: "drawOval takes x, y, width, height. When width equals height, you get a circle." } }
 ],
 terms: [["Identifier", "The name you give a variable, function, or class"], ["Comment", "A note in code that the computer ignores"], ["Indentation", "Spacing at the start of a line that shows code structure"], ["Prompt", "Text that tells the user what to enter"], ["Formatted output", "Output with set decimal places, widths, and alignment"], ["Vector graphics", "Images drawn from shapes defined by coordinates"], ["Style guide", "A shared set of rules for writing readable code"]],
 qs: [
  { id: "u14q1", q: "Which variable name follows good style?", c: { py: ["x1", "tp", "total_price", "TOTALPRICE!"], java: ["x1", "tp", "totalPrice", "TOTALPRICE!"] }, a: 2, e: "Descriptive identifiers say what the value means." },
  { id: "u14q2", q: "What is the main purpose of a comment?", c: ["Make the program run faster", "Explain the code to people reading it", "Store data", "Fix syntax errors"], a: 1, e: "Comments are ignored by the computer and help human readers." },
  { id: "u14q3", q: "Which prompt is clearest?", c: ["?", "Enter:", "Enter your test score (0-100): ", "Input data"], a: 2, e: "A good prompt says exactly what to type, including the allowed range." },
  { id: "u14q4", q: "What is printed?", code: { py: "price = 7.5\nprint(f\"${price:.2f}\")", java: "double price = 7.5;\nSystem.out.printf(\"$%.2f%n\", price);" }, c: ["$7.5", "$7.50", "$8", "$7.500"], a: 1, e: ".2f shows exactly two digits after the decimal point." },
  { id: "u14q5", q: "Why is the second print better?", code: { py: "print(42)\nprint(\"Average score:\", 42)", java: "System.out.println(42);\nSystem.out.println(\"Average score: \" + 42);" }, c: ["It runs faster", "The output is labeled so the user knows what 42 means", "It uses less memory", "There's no difference"], a: 1, e: "Labeled output tells the user what each value represents." },
  { id: "u14q6", q: { py: "In turtle, what does t.circle(50) draw?", java: "What does g.drawOval(0, 0, 80, 80) draw?" }, c: { py: ["A circle with radius 50", "A circle with diameter 50", "50 circles", "A square"], java: ["A circle 80 pixels wide", "An oval 0 pixels wide", "A rectangle", "A line"] }, a: 0, e: { py: "turtle.circle takes a radius.", java: "When width and height are equal, drawOval draws a circle." } },
  { id: "u14q7", q: "Which is a vector graphic shape?", c: ["A JPEG photo", "A rectangle drawn from coordinates", "A screenshot", "A video"], a: 1, e: "Vector graphics are built from shapes like lines, circles, and rectangles." },
  { id: "u14q8", q: "Consistent indentation mainly helps with:", c: ["Readability and showing structure", "Faster downloads", "Making variables global", "Avoiding comments"], a: 0, e: "Indentation shows which lines belong together. In Python, it's also required by the language." }
 ]
},
{
 id: "u15", title: "Math, Random & Error Handling",
 blurb: "Math functions, random numbers, classic algorithms, and safe programs.",
 lesson: [
  { h: "Math library", p: "Languages include ready-made math functions so you don't have to write them yourself.",
    code: { py: "import math\nprint(abs(-7))          # 7\nprint(round(3.14159, 2)) # 3.14\nprint(2 ** 5)           # 32 (power)\nprint(math.sqrt(49))    # 7.0\nprint(6 ** 2)           # 36 (square)", java: "System.out.println(Math.abs(-7));       // 7\nSystem.out.println(Math.round(3.6));    // 4\nSystem.out.println(Math.pow(2, 5));     // 32.0\nSystem.out.println(Math.sqrt(49));      // 7.0\nSystem.out.println(6 * 6);              // 36 (square)" } },
  { h: "Random numbers", p: "Games, simulations, and quizzes use <mark>random numbers</mark>.",
    code: { py: "import random\ndie = random.randint(1, 6)    # 1 to 6, both included\ncoin = random.choice([\"H\", \"T\"])\nprint(die, coin)", java: "import java.util.Random;\n\nRandom rng = new Random();\nint die = rng.nextInt(6) + 1;   // 0-5, plus 1 gives 1-6\nSystem.out.println(die);" },
    after: { py: "random.randint(a, b) includes both a and b.", java: "nextInt(6) gives 0 through 5, so add 1 for a die roll." } },
  { h: "Classic algorithms", p: "These algorithms show up again and again in CS I.",
    list: ["<mark>Largest of three</mark>: compare a to b, then the winner to c.", "<mark>Average</mark>: add the values with an accumulator, then divide by the count.", "<mark>Prime check</mark>: a number n > 1 is prime if no number from 2 up to the square root of n divides it evenly.", "<mark>GCD</mark> (Euclid): replace (a, b) with (b, a % b) until b is 0. Then a is the GCD.", "<mark>Making change</mark>: use integer division and % to count quarters, dimes, nickels, and pennies."],
    code: { py: "def gcd(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\nprint(gcd(48, 18))   # 6\n\ncents = 68\nquarters = cents // 25   # 2\ncents = cents % 25       # 18 left", java: "public static int gcd(int a, int b) {\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}\n// gcd(48, 18) returns 6\n\nint cents = 68;\nint quarters = cents / 25;  // 2\ncents = cents % 25;         // 18 left" } },
  { h: "Handling errors", p: "Programs should not crash on bad input. Use <mark>exception handling</mark> to catch common errors like <mark>division by zero</mark> and <mark>type mismatch</mark> (letters typed where a number was expected).",
    code: { py: "try:\n    count = int(input(\"How many people? \"))\n    print(\"Each gets\", 12 / count, \"slices\")\nexcept ValueError:\n    print(\"Please type a whole number.\")\nexcept ZeroDivisionError:\n    print(\"The number of people can't be 0.\")", java: "try {\n    int count = Integer.parseInt(text);\n    System.out.println(\"Each gets \" + (12 / count));\n} catch (NumberFormatException e) {\n    System.out.println(\"Please type a whole number.\");\n} catch (ArithmeticException e) {\n    System.out.println(\"The number of people can't be 0.\");\n}" } },
  { h: "Four kinds of errors", list: ["<mark>Lexical error</mark>: a character or token the language doesn't recognize, such as an unclosed string.", "<mark>Syntax error</mark>: the words are real, but the grammar is wrong, such as a missing colon or semicolon.", "<mark>Run-time error</mark>: the program crashes while running, such as dividing by zero.", "<mark>Logic error</mark>: the program runs but gives the wrong answer."] }
 ],
 terms: [["Math library", "Built-in functions like abs, round, pow, and sqrt"], ["Random number", "An unpredictable value a program generates"], ["GCD", "Greatest common divisor: the largest number that divides both values"], ["Prime number", "A whole number above 1 divisible only by 1 and itself"], ["Exception", "An error event that happens while a program runs"], ["Exception handling", "Code that catches errors so the program doesn't crash"], ["Lexical error", "A character or token the language doesn't recognize"]],
 qs: [
  { id: "u15q1", q: "What is printed?", code: { py: "print(abs(-12) + 3)", java: "System.out.println(Math.abs(-12) + 3);" }, c: ["-9", "15", "9", "-15"], a: 1, e: "abs(-12) is 12, and 12 + 3 = 15." },
  { id: "u15q2", q: { py: "Which can random.randint(1, 6) return?", java: "Which can rng.nextInt(6) + 1 return?" }, c: ["0 through 5", "1 through 6", "1 through 5", "0 through 6"], a: 1, e: { py: "randint includes both ends, so 1 through 6.", java: "nextInt(6) gives 0-5. Adding 1 gives 1-6." } },
  { id: "u15q3", q: "What is the GCD of 48 and 18?", c: ["2", "3", "6", "9"], a: 2, e: "48 % 18 = 12, 18 % 12 = 6, 12 % 6 = 0. The GCD is 6." },
  { id: "u15q4", q: "How many quarters are in 68 cents?", code: { py: "print(68 // 25)", java: "System.out.println(68 / 25);" }, c: ["2", "2.72", "3", "18"], a: 0, e: "Integer division drops the remainder: 68 divided by 25 is 2 whole quarters." },
  { id: "u15q5", q: "Which number is prime?", c: ["21", "27", "29", "33"], a: 2, e: "29 has no divisors besides 1 and 29. 21 = 3×7, 27 = 3×9, 33 = 3×11." },
  { id: "u15q6", q: "A user types \"ten\" when the program expects a number. What kind of problem is this?", c: ["A type mismatch", "A lexical error in the code", "Integer overflow", "A comment"], a: 0, e: "Text was entered where a number was expected. Handle it with try/except or try/catch." },
  { id: "u15q7", q: "Which error makes a program run but give the wrong answer?", c: ["Syntax error", "Lexical error", "Run-time error", "Logic error"], a: 3, e: "Logic errors don't crash the program. They produce wrong results." },
  { id: "u15q8", q: { py: "Which exception does 10 / 0 raise in Python?", java: "Which exception does 10 / 0 (int division) throw in Java?" }, c: { py: ["ValueError", "ZeroDivisionError", "TypeError", "IndexError"], java: ["NumberFormatException", "ArithmeticException", "NullPointerException", "IndexOutOfBoundsException"] }, a: 1, e: { py: "Dividing by zero raises ZeroDivisionError.", java: "Integer division by zero throws ArithmeticException." } },
  { id: "u15q9", q: "Which algorithm finds the largest of three numbers a, b, c?", c: ["Add them and divide by 3", "Compare a and b, then compare the larger one to c", "Sort them alphabetically", "Pick one at random"], a: 1, e: "Two comparisons are enough: find the larger of a and b, then compare it to c." }
 ]
},
{
 id: "u16", title: "Digital Citizenship & Security",
 blurb: "Copyright, licenses, privacy, safe passwords, and tech's impact.",
 lesson: [
  { h: "Intellectual property", p: "<mark>Intellectual property</mark> is creative work that belongs to someone, including code, music, images, and writing. <mark>Copyright</mark> protects it automatically when it's created.",
    list: ["<mark>Proprietary</mark> software: you buy a license to use it, but can't copy or change it.", "<mark>Open-source</mark> software: the code is shared, and its license says how you may use, change, and share it.", "<mark>Public domain</mark>: no copyright restrictions remain.", "Always credit sources and follow the license, even for free code you find online."] },
  { h: "Acceptable use and etiquette", p: "Schools and employers have an <mark>acceptable use policy</mark> (AUP) that explains how their devices and networks may be used. <mark>Digital etiquette</mark> means being respectful online: no harassment, no spam, and no sharing other people's information without permission." },
  { h: "Protecting accounts", list: ["Use long <mark>passphrases</mark> like four random words with a number and symbol.", "Never reuse one password across many sites.", "Turn on <mark>two-factor authentication</mark> (2FA), which asks for a second proof like a code on your phone.", "Watch for <mark>phishing</mark>: messages that pretend to be trusted senders to steal logins."] },
  { h: "Viruses and malware", p: "<mark>Malware</mark> is software designed to cause harm, including viruses, worms, ransomware, and spyware. Prevent it by keeping software updated, using antivirus protection, downloading only from trusted sources, and not opening unexpected attachments." },
  { h: "Privacy and data", p: "Apps collect data about what you do. Read privacy settings, share less personal information, and think before posting. Anything posted online can be copied and stay public." },
  { h: "Computing and society", p: "New technology like <mark>artificial intelligence</mark>, facial recognition, and self-driving cars brings benefits and risks. Ask: Who benefits? Who could be harmed? Is the data fair and private? Is it used ethically?" }
 ],
 terms: [["Intellectual property", "Creative work that legally belongs to its creator"], ["Copyright", "Legal protection for original creative work"], ["Software license", "Rules for how software may be used, changed, and shared"], ["Open source", "Software whose code is shared under a license"], ["Acceptable use policy", "Rules for using an organization's devices and network"], ["Two-factor authentication", "Logging in with a password plus a second proof"], ["Malware", "Software designed to harm a computer or steal data"], ["Phishing", "A fake message that tricks people into revealing information"]],
 qs: [
  { id: "u16q1", q: "You find code on a website with an open-source license. What should you do?", c: ["Use it however you want", "Follow the license and credit the author", "Claim it as your own", "Never use any online code"], a: 1, e: "Open-source licenses allow use under specific conditions, which usually include giving credit." },
  { id: "u16q2", q: "Which password is strongest?", c: ["password1", "Maya2009", "Correct-Horse-Battery-77!", "qwerty"], a: 2, e: "Long passphrases with mixed characters are much harder to guess." },
  { id: "u16q3", q: "What is two-factor authentication?", c: ["Using two passwords", "A password plus a second proof like a phone code", "Logging in twice", "Sharing your password with a friend"], a: 1, e: "2FA adds a second factor, so a stolen password alone isn't enough." },
  { id: "u16q4", q: "An email says it's from your school and asks for your password at a link. This is:", c: ["Phishing", "A firewall", "Encryption", "An AUP"], a: 0, e: "Phishing fakes a trusted sender to steal credentials." },
  { id: "u16q5", q: "What is an acceptable use policy?", c: ["A software license for games", "Rules for using an organization's computers and network", "A type of virus", "A privacy setting"], a: 1, e: "An AUP explains what you may and may not do on school or work technology." },
  { id: "u16q6", q: "Which action best prevents malware?", c: ["Opening every attachment", "Turning off updates", "Downloading only from trusted sources and keeping software updated", "Disabling antivirus"], a: 2, e: "Updates close security holes, and trusted sources reduce risk." },
  { id: "u16q7", q: "Copyright protects a song you wrote:", c: ["Only after you register it", "Automatically, as soon as it's created", "Only if you sell it", "Never"], a: 1, e: "In the U.S., copyright applies automatically once a work is created in fixed form." },
  { id: "u16q8", q: "A city wants to use facial recognition in schools. Which is an ethical question to ask?", c: ["What color is the camera?", "Is the data private and is the system fair to everyone?", "How fast is the Wi-Fi?", "Which font does the app use?"], a: 1, e: "Ethical review asks who benefits, who could be harmed, and whether data is fair and private." }
 ]
},
{
 id: "u17", title: "Careers & Teamwork in CS",
 blurb: "Jobs, college programs, portfolios, and working on a team.",
 lesson: [
  { h: "Careers in computer science", p: "Computer science skills are used in almost every industry, including healthcare, energy, games, finance, and government.",
    list: ["<mark>Software developer</mark>: designs and builds apps and systems.", "<mark>Web developer</mark>: builds websites and web apps.", "<mark>Data analyst / data scientist</mark>: finds patterns in data.", "<mark>Cybersecurity analyst</mark>: protects systems and networks.", "<mark>Product or project manager</mark>: plans what gets built and keeps teams on track.", "<mark>Game developer</mark>, <mark>IT support specialist</mark>, and <mark>AI/machine learning engineer</mark>."] },
  { h: "Getting ready", list: ["<mark>Internships</mark> give real work experience while you're still in school.", "A <mark>resume</mark> is a one-page summary of your skills, experience, and education.", "A <mark>portfolio</mark> shows your best projects, often on GitHub or a personal website.", "<mark>Certifications</mark> (such as industry IT, cloud, or programming certificates) prove specific skills.", "Compare <mark>university programs</mark> by courses offered, cost, internships, and outcomes like graduation and job placement."] },
  { h: "Working on a team", p: "Most software is built by teams. Good teammates communicate clearly, share the work, meet deadlines, and accept feedback.",
    list: ["<mark>Technical writing</mark>: clear documentation, comments, and README files.", "<mark>Code review</mark>: teammates check each other's code and suggest fixes.", "Plan your time: break work into tasks and set deadlines.", "Be a leader and a learner: help others, ask questions, and respond well to feedback."] },
  { h: "Legal and ethical responsibilities", p: "Professionals protect user data, respect copyright and licenses, test their work, and are honest about what their software can and can't do." }
 ],
 terms: [["Internship", "Short-term, real work experience while studying"], ["Resume", "A one-page summary of skills, experience, and education"], ["Portfolio", "A collection of your best projects to show employers"], ["Certification", "A credential that proves a specific skill"], ["Code review", "Teammates checking each other's code"], ["Technical writing", "Clear documentation that explains how something works"], ["Software developer", "A person who designs and builds software"]],
 qs: [
  { id: "u17q1", q: "Which best shows an employer what you can build?", c: ["A portfolio of projects", "A list of your hobbies", "Your phone number", "Your favorite game"], a: 0, e: "A portfolio, such as a GitHub profile or website, shows real work." },
  { id: "u17q2", q: "Who protects systems and networks from attacks?", c: ["Web designer", "Cybersecurity analyst", "Data entry clerk", "Game tester"], a: 1, e: "Cybersecurity analysts defend systems and respond to threats." },
  { id: "u17q3", q: "What is an internship?", c: ["A college degree", "Short-term work experience while you're studying", "A type of certification exam", "A programming language"], a: 1, e: "Internships give real-world experience and connections." },
  { id: "u17q4", q: "A teammate suggests a fix in a code review. The best response is to:", c: ["Ignore it", "Consider it, ask questions, and apply it if it improves the code", "Argue until they give up", "Delete your code"], a: 1, e: "Seeking and responding to feedback improves the quality of your product." },
  { id: "u17q5", q: "Which is the best example of technical writing?", c: ["A text message to a friend", "A README that explains how to install and run a program", "A poem", "A game score"], a: 1, e: "Technical writing explains how something works clearly and accurately." },
  { id: "u17q6", q: "When comparing university computer science programs, which factor matters?", c: ["The color of the campus buildings", "Courses offered, cost, and internship opportunities", "The mascot", "How many vending machines there are"], a: 1, e: "Courses, cost, internships, and outcomes help you choose a program." },
  { id: "u17q7", q: "Your team has a project due in two weeks. What's the best plan?", c: ["Start the night before", "Break it into tasks with owners and deadlines", "Let one person do everything", "Skip testing"], a: 1, e: "Planning and time management keep teams on schedule." },
  { id: "u17q8", q: "A resume should usually be:", c: ["Ten pages long", "A clear, one-page summary of skills, experience, and education", "Written in code", "A list of passwords"], a: 1, e: "Early-career resumes are typically one page and easy to scan." }
 ]
}
];

// TEKS codes for every unit (Computer Science I, knowledge and skills (1)-(6)).
module.exports.TEKS = {
 u1: ["4A", "4B", "4C", "4F", "4G", "4Q"],
 u2: ["6K", "6M"],
 u3: ["3B", "4D", "4P", "6N", "6O"],
 u4: ["4N", "4O", "4P"],
 u5: ["6P"],
 u6: ["4M", "4R", "4T", "4U", "6J"],
 u7: ["4M", "4S"],
 u8: ["4E", "6E", "6G", "6H", "6I"],
 u9: ["4K", "6Q", "6R"],
 u10: ["4K", "6Q"],
 u11: ["6D", "6F", "6O"],
 u12: ["4H", "4I", "4J", "5A", "5D"],
 u13: ["6A", "6B", "6C", "6E", "6L", "6O", "6S"],
 u14: ["1C", "3A", "3B", "3C", "3D", "3E"],
 u15: ["4H", "4K", "4L", "4O", "4V"],
 u16: ["5A", "5B", "5C", "5D", "5E"],
 u17: ["1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "1I", "2A", "2B"]
};
