/* replace in emote */

#include <ansi.h>

inherit F_CLEAN_UP;
int help(object me);

int main(object me, string arg)
{
        mapping emote;
        string *e, *loop;
        string result;
        int count;

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

        count = 0;
        loop = keys(EMOTE_D->query_emote("kok")) - ({ "time", "updated" });
        write(sprintf("替代索引：%O\n", loop));
        foreach (e in EMOTE_D->query_all_emote())
        {
                count++;
                emote = EMOTE_D->query_emote(e);
                for (int j = 0; j < sizeof(loop); j++)
                {
                        result = emote[loop[j]];
                        if (! result) continue;
                        result = replace_string(result, ", ", "，");
                        result = replace_string(result, "! ", "！");
                        result = replace_string(result, "; ", "；");
                        result = replace_string(result, "~ ", "～");
                        result = replace_string(result, ": ", "：");
                        result = replace_string(result, "\" ", "");
                        result = replace_string(result, " \"", "");
                        result = replace_string(result, " ,", "，");
                        result = replace_string(result, " !", "！");
                        result = replace_string(result, " ;", "；");
                        result = replace_string(result, " ~", "～");
                        result = replace_string(result, " :", "：");
                        result = replace_string(result, ",", "，");
                        result = replace_string(result, "!", "！");
                        result = replace_string(result, ";", "；");
                        result = replace_string(result, "~", "～");
                        result = replace_string(result, ":", "：");
                        result = replace_string(result, "\"", "");
                        if (emote[loop[j]] != result)
                                write("result = " + result + "\n");
                        emote[loop[j]] = result;
                }
        }

        write("一共搜索了" + chinese_number(count) + "个表情动词。\n");
        return 1;
}

int help(object me)
{
  write(@HELP
指令格式 : replace in emote

功能：替换emote中所有的英文标点符号为中文标点符号。
HELP );
    return 1;
}
