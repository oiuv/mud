#include <ansi.h>

void do_nothing(string nothing);

int main(object who,string arg)
{   
    write(REF);
    if(arg=="-l")
    input_to( (:do_nothing:) );
    return 1;
}

int help()
{
    write(@HELP
指令格式：cls [-l]
这个指令可以清除当前屏幕内容。
如果有-l这个参数就暂缓屏幕输出。只至按回车健。
HELP );
    return 1;
}

void do_nothing(string nothing)
{
    return;
}
