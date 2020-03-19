// by naihe 200?.??.??   不记得什么时候写的了
// 有时候可以替代 notify_fail() ，在一些 add_action() 函数里 return errs() 可以禁止继续执行。
varargs int errs(string msg, object who)
{
        if( !msg )
                return 1;
        if( objectp(who) )
                tell_object( who, msg );
        else
                write( msg );
        return 1;
}

