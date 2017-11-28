/*
 * modify name to femote.c
 * make code less
 * by ken@XAJH
 */

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
        mapping emote;
        string *e, *loop;
        string syntax;
        int l;
        string result="", msg;
        int count=0;

        loop = ({ "others_target", "others_self", "others" });
        if (! arg)
                return help(me);

        if (time() - me->query_temp("scan_time") < 20 &&
	    ! wizardp(me))
                return notify_fail("等等，系统喘气中......\n");

        syntax = replace_string(arg, "%", "");
        l = -1;
        while (l != strlen(syntax))
        {
                l = strlen(syntax);
                syntax = replace_string(syntax, "**", "*");
        }
        syntax = replace_string(syntax, "*", "%*s");
        if (syntax[0..2] != "%*s") syntax = "%*s" + syntax;
        if (syntax[strlen(syntax)-3..<1] != "%*s") syntax = syntax + "%*s";

        foreach (e in sort_array(EMOTE_D->query_all_emote(), 1))
        {
                emote = EMOTE_D->query_emote(e);
                for (int j = 0; j < sizeof(loop); j++ )
                {
                        msg = emote[loop[j]];
                        if (msg && sscanf(msg, syntax))
                        {
                                result += sprintf(HIR "%s\n"+NOR+"动作: %s\n", e, msg);
                                count++;
				if (count > 200)
					return notify_fail("查找到的符合条件"
						"的 emote 太多，请重新指定关"
						"键字进行搜索。\n");
                        }
                }
        }

        if (result == "")
                return notify_fail(LOCAL_MUD_NAME() + "中无符合查询条件的 emote。\n");
        else
                result = "\n查询结果"
                         "\n------------------------------------------------------------\n"
                                + result;
        result = replace_string(result, "$n", "某人");
        result = replace_string(result, "$N", me->name(1));
        result = replace_string(result, "$P", "你");
        result = replace_string(result, "$p", "(他/她)");
        result = replace_string(result, "$S", RANK_D->query_self(me));
        result = replace_string(result, "$s", RANK_D->query_self_rude(me));
        result = replace_string(result, "$R", "壮士");
        result = replace_string(result, "$r", "臭贼");
        result = replace_string(result, "$C", "愚兄我");
        result = replace_string(result, "$c", "哥哥");

        result += "------------------------------------------------------------\n";
        result += sprintf("在%s中，包含“%s”的 emote 共有 %d 个。\n",
                          LOCAL_MUD_NAME(), arg, count);
        me->set_temp("scan_time",time());
        me->start_more(result);
        return 1;
}

int help(object me)
{
  	write(@HELP
指令格式 : femote 关键字
功能：列出目前所有含指定关键字的 emote。比如：

femote *飞起一脚，正好踢中*的* 
或者
femote 飞起

只要匹配到了femote指定的关键字，即返回一个结果。如果在匹配的
字符串中使用了"*"， 可以匹配任何单词。查找的时候所有的姓名应
该转换成"*"。

Dean, ken@XAJH
HELP );
    return 1;
}
