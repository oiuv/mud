// lazhu.c

inherit ITEM;

void create()
{
        set_name( "蜡烛", ({ "zhu", "lazhu" }) );
        set_weight(10);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", "这是一只普通的蜡烛，上面镂着一些花纹，还比较精致。\n");
        }
        setup();
}

void init()
{
        call_out("dest", 1800);
}

void dest()
{
        write("眼前烛光一闪，不好，蜡烛熄灭了。\n");
        destruct(this_object());
}
