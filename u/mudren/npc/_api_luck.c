inherit "u/mudren/http/mobile_d.c";

#include <ansi.h>

void response(mixed result)
{
    // debug(result);
    result = result[strsrch(result, "{")..];
    result = json_decode(result);
    if (result["status"])
    {
        tell_object(Receiver, "……\n");
    }
    else
    {
        string str;
        result = result["result"];
        str = "号码『" + result["mobile"] + "』的占卜结果：\n";
        str += "----------------------------------------\n";
        str += HIM "数理分数：" + result["score"] + NOR + "\n";
        str += HIY "号码吉凶：" + result["luck"] + NOR + "\n";
        str += HIY "吉凶分析：" + result["content"] + NOR + "\n";
        str += HIW "主人个性：" + result["character"] + NOR + "\n";
        str += HIW "具体表现：" + sort_string(result["characterdetail"], 48, 10) + NOR + "\n";
        str += "----------------------------------------\n";
        tell_object(Receiver, str);
    }
}
