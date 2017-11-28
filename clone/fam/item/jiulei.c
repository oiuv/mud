#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIM "¾ÅÀ×ĞşÒôÉ´" NOR, ({"xuanyin sha", "xuanyin", "sha"}));
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "±¡Èç²õÒíµÄÉ´³ñ£¬ËäÈ»ÇáÈôºèÃ«£¬È´ÊÇ¼áÈÍËÆÌú¡£\n" NOR);
                set("unit", "ÕÅ");
                set("value", 9000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIM "¾ÅÀ×ĞşÒôÉ´" NOR);
                set("can_make", ({ "»¤¼×", "Õ½ÒÂ", "Ñü´ø", "»¤Íó", "Ñ¥×Ó", "±Ş" }));
                set("power_point", 60);
        }
}

int query_autoload()
{
        return 1;
}

