// tiexiang.c

inherit ITEM;
void setup()
{}

void init()
{
        add_action("do_climb", "climb");
}

void create()
{
        set_name("铁箱", ({"tie xiang", "xiang", "box"}));
        set_weight(200000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一只有大又笨的铁箱子，有些生锈了。\n");
                set("unit", "只");
                set("material", "steal");
        }
        setup();
}

int do_climb(string arg)
{
        object me = this_player();
        if (!id(arg))
                return notify_fail("你要往哪儿爬？\n");
        if (this_player()->query_temp("marks/跳1") ) {
                       write("你怎么爬个没完没了？\n");
                        return 1;
        }
        else {
               message("vision",this_player()->name() + "爬上箱子。\n",
                        environment(me), ({me}) );
               write("你爬上箱子。\n");
                this_player()->set_temp("marks/跳1", 1);
        return 1;
        }
}

