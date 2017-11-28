#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIY "锦襕袈裟" NOR, ({ "jinlan jiasha", "jinlan", "jiasha" }));
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "件");
                set("long", HIY "锦襕袈裟乃少林寺历代相传的圣物，是由冰蚕"
                            "造练抽丝，巧匠\n翻腾为线，仙娥织就，神女机成"
                            "。方方簇幅绣花缝，片片相帮\n堆锦簆。穿上满身"
                            "红雾绕，脱来一段彩云飞。\n" NOR);
                set("wear_msg", HIY "只听「哗」的一声，$N展开一件金光闪闪"
                            "的袈裟披在身上。瞬\n时瑞气千条，祥云朵朵。遥"
                            "见$N气象庄严，真可谓五岳山前生\n宝气，三天门"
                            "外透玄光。重重嵌就西番莲，灼灼悬珠星斗象。\n"
                            NOR);
                set("remove_msg", HIY "$N将锦襕袈裟从身上脱下，折叠成小小"
                            "的一团。\n" NOR);
                set("no_sell", "东西是好，可惜少林寺贼秃厉害，俺没胆子收。");
                set("value", 100000);
                set("material", "silk");
                set("armor_prop/armor", 200);
                set("stable", 100);
        }
        setup();
}
