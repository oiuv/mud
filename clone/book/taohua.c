// taohua.c

#include <ansi.h>
#include <medical.h>

inherit MEDICAL_BOOK;

void create()
{
        set_name(HIG "桃花药术" NOR, ({ "taohua yaoshu", "yaoshu" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本泛黄的书籍，上面用古篆书"
                            "写着“桃花药术”几个字。\n",

                );
                set("material", "paper");
                set("skill", ([
                        "name": "taohua-yaoli",
                        "jing_cost": 60,
                        "difficulty": 40,
                        "max_skill": 160,
                        "min_skill": 30,
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
        setup();
}
