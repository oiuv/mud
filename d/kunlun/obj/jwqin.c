#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name(NOR + RED "焦尾琴" NOR, ({ "jiaowei qin", "jiaowei", "qin" }));
        set_weight(600);

        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "台");
                set("long", RED "相传这便是当年蔡文姬从火中所救出的焦木"
                            "做成的美琴，琴的\n尾端仍可见焦黑色。\n" NOR);
                set("value", 10000);
                set("material", "wood");
        }
        setup();
}

void init()
{
        add_action("play_qin", "play");
}
