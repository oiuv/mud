// tiepipa.c

#include <weapon.h>
#include <ansi.h>
#include <music.h>

inherit HAMMER;
inherit MI_QIN;

void create()
{
        set_name("瑶琴", ({ "yao qin" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把歌女用的瑶琴，制做得相当精巧细腻。\n");
                set("value", 300);
                set("material", "iron");
                set("wield_msg", "$N从背上解下一把$n，然後横在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_hammer(5);
        setup();
}

void init()
{
	add_action("play_qin", "play");
}

