#include <ansi.h>
#include <medical.h>

inherit MEDICAL_BOOK;

void create()
{
        set_name(RED "「药王神篇」" NOR, ({ "yaowang shenpian", "yaowang",
                                            "shenpian", "pian", "book" }));
        set_weight(600);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("no_sell",1);
                set("long", RED "一本薄薄的书籍，封面豁然写着“药王神篇”四个字。\n" NOR);
                set("value", 800000);
                set("no_sell", 1);
                set("material", "paper");
                set("skill", ([
                        "name":         "yaowang-shenxin",
                        "exp_required": 250000,
                        "jing_cost" :   50,
                        "difficulty":   50,
                        "max_skill":    249,
                        "min_skill":    100
                ]));

                set("can_make", ([
                        "liuhe" : 80,           // 六合返精散
                        "qingxin" : 100,        // 清心定神散
                        "zhending": 150,        // 固元镇定散
                        "dieda" : 80,           // 跌打伤愈膏
                        "huojin" : 100,         // 活筋舒血丸
                        "tongmai" : 150,        // 贯气通脉丹
                        "jiedu" : 100,          // 牛黄解毒丸
                        "jiuhua" : 200,         // 九花玉露丸
                        "wuchang" : 250,        // 无常丹
                ]));

        }
}
