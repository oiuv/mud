// hongchou.c
inherit ITEM;
void setup()
{}

void init()
{
        add_action("do_tear", "tear");
}

void create()
{
        set_name("红绸", ({"hong chou", "chou"}));
        set_weight(800);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一块很完整的红绸，但已经开始变色了。\n");
                set("unit", "件");
                set("material", "cloth");
                set("no_get", "这块红绸已经被牢牢的钉住了。\n");
                set("cloth_count",1);

        }
        setup();
}

int do_tear(string arg)
{
        object me , ob;
        me = this_player();
        if (arg == "hong chou" && !present("zhanyi", me) && query("cloth_count")>= 1)
        {
                add("cloth_count", -1);
                ob=new("/clone/book/zhanyi");
                ob->move("/d/meizhuang/dingduan");
                message_vision("$N把红绸撕开，发现里面包着一件衣服。\n", me);
                return 1;
        }
        else {
                message_vision("$N把红绸撕开，但里面什么都没有。\n", me);
                return 1;
             }
}

