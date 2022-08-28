#include <ansi.h>

inherit CORE_HTTP;
inherit ITEM;

nosave object Receiver;

void create()
{
    set_name(CYN "成语词典" NOR, ({"idiom book", "book", "idiom"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", HIW @LONG
    这是一本厚厚的成语词典，你可以用来查询任何成语的读音、解释和出处。
(指令：cha [关键词] 和 chengyu [成语])
LONG NOR);
        set("unit", "本");
        set("no_get", "这是公共图书，你还是别拿走的好。\n");
        set("material", "paper");
    }
}

void init()
{
    add_action("do_read", ({"idiom", "chengyu"}));
    add_action("do_search", ({"index", "cha"}));
}

int do_search(string arg)
{
    string url = "http://api.jisuapi.com/chengyu/search?appkey=" + env("AppKey") + "&keyword=" + arg;

    Receiver = this_player();
    if (is_chinese(arg))
    {
        msg("info", "$ME翻开成语词典开始查找和 " + arg + " 相关的成语。\n", Receiver);
        Http::get(url);
        return 1;
    }

    return 0;
}

int do_read(string arg)
{
    string url = "http://api.jisuapi.com/chengyu/detail?appkey=" + env("AppKey") + "&chengyu=" + arg;

    Receiver = this_player();
    if (is_chinese(arg))
    {
        msg("info", "$ME翻开成语词典开始查成语『" + arg + "』的释义。\n", Receiver);
        Http::get(url);
        return 1;
    }

    return 0;
}

private void response(mixed result)
{
    result = result[strsrch(result, "{")..];
    result = result[0..strsrch(result, "}", -1)];
    result = json_decode(result);
    // debug(result);
    if (!result["status"])
    {
        string idiom;

        result = result["result"];
        if (arrayp(result))
        {

            int total = sizeof(result);

            idiom = HIY "相关的成语找到 " + total + " 条，具体如下：" NOR + "\n";
            idiom += "----------------------------------------\n";
            foreach (mapping list in result)
            {
                idiom += HIC "  " + list["name"] + NOR + "\n";
            }
            idiom += "----------------------------------------\n";

            idiom += HIG "可以使用 `chengyu <成语>` 查指定成语详细释义。" NOR "\n";

            tell_object(Receiver, idiom);
        }
        else if(mapp(result))
        {
            idiom = "----------------------------------------\n";
            idiom += HIY "『成语』" + result["name"] + NOR "\n";
            idiom += HIW "『读音』" + result["pronounce"] + NOR + "\n";
            idiom += "----------------------------------------\n";
            idiom += HIC "『解释』" + sort_string(result["content"], 72, 8) + NOR;
            if (result["comefrom"])
            {
                idiom += HIW "『出处』" + sort_string(result["comefrom"], 72, 8) + NOR;
            }
            if (sizeof(result["example"]))
            {
                idiom += WHT "『示例』" + sort_string(result["example"], 72, 8) + NOR;
            }
            if (arrayp(result["thesaurus"]) || arrayp(result["antonym"]))
            {
                idiom += "----------------------------------------\n";
                if (arrayp(result["thesaurus"]))
                {
                    idiom += CYN "近义词：" + sprintf("%@-9s", result["thesaurus"]) + NOR + "\n";
                }
                if (arrayp(result["antonym"]))
                {
                    idiom += CYN "反义词：" + sprintf("%@-9s", result["antonym"]) + NOR + "\n";
                }
            }
            idiom += "----------------------------------------\n";
            tell_object(Receiver, idiom);
        }
    }
    else
        tell_object(Receiver, "这本书不知道被谁涂抹的乱七八糟的，什么内容也看不清了。\n");
}
