#include <ansi.h>
inherit ITEM;

void create()
{
        set_name("油布包", ({ "bag", "bao" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", "这是一个油布包裹。\n");
                set("value", 500);
                set("material", "cloth");
        }
        set("book_count", 1);
}

void init()
{
        if (this_player() == environment())
        {
                add_action("do_open", "open");
                add_action("do_open", "unpack");
                add_action("do_open", "dakai");
        }
}

int do_open(string arg)
{
        object me, book;
        object where;

        if (! arg || ! id(arg))
                return 0;

        if (query("book_count") < 1)
        {
                write("油布包里面什么也没有了。\n");
                return 1;
        }

        me = this_player();
        where = environment(me);
        message_vision(YEL "\n$N" YEL "轻轻地把油布包来看时，里"
                       "面原来是一本薄薄的经书，只因油布\n包得紧"
                       "密，虽长期藏在猿腹之中，书页仍然完好无损"
                       "。\n", me);
        book = new("/d/mingjiao/obj/jing");
        book->move(me);
        add("book_count", -1);
        return 1;
}
