#include <ansi.h>
#include <medical.h>

inherit MEDICAL_BOOK;

void create()
{
        set_name(HIM "「桃花药理」" NOR, ({ "taohua yaoli", "yaoli", "book", "shu" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIM "一本陈旧的书册，封面用篆书写有「桃花药理」四字。\n\n" NOR);
                set("material", "paper");
                set("value", 1);
                set("no_sell", "嘿，这本破书也能卖钱？");
                set("skill", ([
                        "name" : "taohua-yaoli",
                        "jing_cost" : 60,
                        "difficulty" : 40,
                        "max_skill" : 159,
                        "min_skill" : 30,
                ]));

                set("can_make", ([
                        "liuhe"    : 80,        // 六合返精散
                        "qingxin"  : 100,       // 清心定神散
                        "zhending" : 150,       // 固元镇定散
                        "dieda"    : 80,        // 跌打伤愈膏
                        "huojin"   : 100,       // 活筋舒血丸
                        "tongmai"  : 150,       // 贯气通脉丹
                        "jiedu"    : 100,       // 牛黄解毒丸
                        "shadan"   : 160,       // 田七鲨胆丸
                        "jiuhua"   : 200,       // 九花玉露丸
                        "wuchang"  : 250,       // 无常丹
                ]));
        }
        setup();
}
