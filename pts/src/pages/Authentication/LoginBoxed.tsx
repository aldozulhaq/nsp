import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useContext, useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import { UserContext } from '../../contexts/UserContext';
import { loginUser } from '../../controllers/usersController';
import Swal from 'sweetalert2';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    });
    const navigate = useNavigate();

    // use user context
    const { user, setUser } = useContext(UserContext)
    // Form data state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Handle login
    const handleLogin = async (e:any) => {
        e.preventDefault()

        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
        })

        try {
            // Login the user
            await loginUser(email, password)
            // use user context
            setUser({email, role: localStorage.role})
            // navigate to dashboard
            toast.fire({
                icon: 'success',
                title: 'Login Success',
                padding: '10px 20px',
            })
            navigate('/')
        } catch (err){
            toast.fire({
                icon: 'warning',
                title: 'Login failed' + err,
                padding: '10px 20px',
            })
        }
    }

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-left bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="container lg:w-[0px] sm:w-[150px] min-[320px]:w-[150px] mb-5">
                            <img src="/assets/images/icon-hd.png" alt="image" />
                        </div>
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-dark text-center md:text-4xl">Project</h1>
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-dark text-center md:text-4xl mb-7">Tracking System</h1>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={handleLogin}>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input id="Email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required/>
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input id="Password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required/>
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign in
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-center rounded-md lg:px-6 md:px-0 sm:px-0 lg:min-h-[758px] lg:w-[1000px] sm:w-[0px] md:w-[0px] min-[320px]:w-[0px]">
                    <img src="/assets/images/icon-hd.png" alt="image" />
                </div>
            </div>
            
        </div>
    );
};

export default LoginBoxed;
