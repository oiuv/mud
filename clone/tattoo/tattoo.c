#include <ansi.h>
inherit ITEM;

string long();

void create()
{
        set_name(NOR + WHT "刺青图" NOR, ({ "tattoo paper", "tattoo", "paper" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("material", "paper");
                set("value", 500);                        // 刺青时的花费与图腾的价值相关
                set("tattoo_long", "精忠报国四个大字");   // 刺青后该部位的描述
                set("can_tattoo", ({ "脸部", "胸口",
                                     "后背", "左臂",
                                     "右臂", "臀部", })); // 身体能够接受刺青的部位
                set("tattoo_type", ({ "膂力", "悟性",     // 增加后天属性的种类，这项属性
                                      "根骨", "身法",     // 的目的仅是让玩家能够看到。
                                      "容貌", }));
                set("tattoo_str", 1);                     // 对应上面的后天属性种类，增加
                set("tattoo_int", 1);                     // 相应的记号。
                set("tattoo_con", 1);
                set("tattoo_dex", 1);
                set("tattoo_per", 1);
                set("tattoo_special", "power");           // 刺青时增加的特殊技能
                set("tattoo_spcname", "天神降世");        // 在look时所提供的提示信息
        }
}

string long()
{
        string msg;

        if (query("can_tattoo"))
        {
                msg = WHT "这是一张" + name() + NOR + WHT "，图中描着" + query("tattoo_long") + "。你可以"
                      "让纹身师傅参照着图样在你的" + implode(query("can_tattoo"),
                      "、") + "上刺青，以提高你的" + implode(query("tattoo_type"),
                      "、") + "。";

                if (query("tattoo_special"))
		{
                        msg += "此外，" + name() + NOR + WHT "还能带"
                               "给你" + query("tattoo_spcname") + NOR
                               WHT "的神秘力量。";
		} else
		{
                        msg += "此外，" + name() + NOR + WHT "似乎还"
                               "蕴藏着某些未知的神秘力量。";
		}
        } else
                msg = "这是一张古旧的图片，上面绘着些纹样。";

        return sort_string(msg, 54);
}

int query_autoload()
{
        return 1;
}

