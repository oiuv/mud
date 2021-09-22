/* mobile.c */
#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
    string phone = me->query_temp("mobile");
    int code = me->query_temp("verify_code");

    if (!arg)
    {
        if (phone = me->query("mobile"))
        {
            write(HIY "你当前绑定的手机号码是：" + phone + "，如需修改请输入：mobile 新号码\n" NOR);
            return 1;
        }
        write(BRED "你还没有绑定安全手机，请输入“mobile 手机号码”根据提示完成绑定。\n" NOR);
        return 1;
    }
    // 验证
    if (code && sizeof(arg) != 11)
    {
        if (atoi(arg) != code)
        {
            return notify_fail(HIR "验证码错误，请重试或重新发送！\n" NOR);
        }
        me->set("mobile", phone);
        write(HIG "手机号码绑定成功。\n" NOR);
        me->delete_temp("verify_code");
        me->delete_temp("mobile");

        // todo 在数据库中记录手机号码绑定的ID信息方便管理
        // todo 在初次绑定时对此手机号绑定的第一个用户给于大量奖励，其它用户微量奖励（推荐强制绑定，不绑定不能正常游戏）

        return 1;
    }
    // 发送验证码
    else if (sizeof(arg) != 11 || !strsrch(arg, "13"))
    {
        return notify_fail(HIR "手机号码格式不正确！\n" NOR);
    }
    else
    {
        code = 1000 + random(9000);
        // 保存验证码
        me->set_temp("verify_code", code);
        me->set_temp("mobile", arg);
        SMS_D->sms(me, code, arg);
        write(HIC "收到验证码后请输入“mobile 验证码”完成验证。\n" NOR);
    }

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式: mobile [phone|code]

这个指令可以让你绑定手机号码或修改绑定的手机号码。

HELP);
    return 1;
}
