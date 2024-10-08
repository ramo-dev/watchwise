import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader } from 'lucide-react';
import Background from "../assets/movie.jpg"
import { useThemeStore } from '../store/store';
import GoBackBtn from '../components/GoBackBtn';
import { Link, useNavigate } from 'react-router-dom';
import useAuthState from '../hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',

  });
  const { isDark } = useThemeStore();
  const { user, register, loading, signInWithGoogle } = useAuthState();
  const navigate = useNavigate();


  //Function to handle password visibility in the input
  const togglePasswordVisibility = () => setShowPassword(!showPassword);


  //Function to handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };


  //Function to handle submit and register new user
  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Form submit triggered", formData);  // Debug here

    const result = await register(formData.username, formData.email, formData.password);
    if (result === undefined || null && !loading && !user.length > 0) {
      toast.error("User already exists");
    } else {
      toast.success("Account created Successfully")
    }
  };


  //Firebase built in auth function to handle sign in user using goolge pop up
  async function handleSignInWithGoogle() {
    try {
      await signInWithGoogle();
      toast.success("Sign in Successful");
    } catch (err) {
      toast.error("Error signing in with Google")
    }
  }

  //Side effect to redirect logged in user to last page visit
  useEffect(() => {
    if (user?.email) {
      navigate(-1)
    }

  }, [user]);


  return (
    <div
      style={{ backgroundImage: `url(${Background})` }}
      className="min-h-screen flex items-center justify-center bg-black/20 ">
      <GoBackBtn />
      <div className={`${isDark ? "from-black to-transparent" : "from-white/50 to-transparent"} absolute inset-0 h-full bg-gradient-to-b `} aria-hidden="true" />
      <div className={`${isDark ? "bg-black/80  text-white" : "bg-white  text-black"} relative md:p-8 px-4 py-20 md:rounded-lg md:shadow-md w-full max-w-md md:h-fit h-screen`}>
        <h2 className="my-6 text-center text-3xl font-extrabold">
          Create your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 my-5">

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="text-black w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="text-black w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="text-black w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700 "} text-white py-2 text-center rounded-md transition duration-300`}
          >
            {loading ? <Loader className='animate-spin mx-auto' /> : "Register"}
          </button>

        </form>
        <small className='flex justify-center mb-2'>or</small>
        <button
          onClick={handleSignInWithGoogle}
          className={`my-2 w-full ${loading ? "bg-gray-600" : "bg-neutral-600 hover:bg-neutral-800"} text-white py-2 text-center rounded-md  transition duration-300`}
        >
          Google
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">

          Already have an account?
          <Link to="/login"
            onClick={() => {/* Handle navigation to signup page */ }}
            className="ml-1 text-blue-600 hover:underline focus:outline-none"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
