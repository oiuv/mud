inherit ROOM;

void create ()
{
        set ("short", "背阴山后");
        set ("long", @LONG

这里是阴司背阴山下，周围一片荒凉，不见草木，一片寂静中
只有阴风呼呼地刮着。山脚下淡发红光鬼焰，传说中的阴司十
八层地狱就在那里。从没有人从那里活着出去。


LONG);

        setup();
}

void init()
{
        add_action("do_get", "eat");
        add_action("do_get", "get");
        add_action("do_get", "kill");
        add_action("do_get", "fight");
        add_action("do_get", "cast");
        add_action("do_get", "bian");
        add_action("do_get", "fly");
        add_action("do_get", "look");
        add_action("do_get", "l");
        add_action("do_get", "perform");
        add_action("do_get", "steal");
   
}
int do_get(string arg)
{
        return 1;
}

