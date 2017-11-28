#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + YEL "檀木古盒" NOR, ({ "tanmu guhe", "tanmu", "guhe" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "这是一个檀木沉香盒，看样子已"
                            "有很长的年时了。\n" NOR);
                set("unit", "个");
                set("value", 15000);
                set("material", "wood");
        }
}
