// jiasha.c
//Jay 4/8/96

inherit ITEM;

void setup()
{
}

void init()
{
        add_action("do_move", "move");
}

void create()
{
        set_name("袈裟", ({"jia sha", "jia", "sha"}));
        set_weight(800);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一件旧得已经看不出颜色的袈裟，上面有好多窟窿。\n");
                set("unit", "件");
                set("material", "cloth");
        }
        setup();
}

int do_move(string arg)
{
        object book;
        object me = this_player();

        if (! id(arg))
                return 0;

        if (this_player()->query("passwd"))
        {
                set("book_got", 1);
                if (! present("kuihua baodian", me) &&
                    ! query("book_got"))
                {
                        message_vision("$N轻轻地挪动袈裟，抖起一些"
                                       "尘土...，突然从袈裟的窟窿中"
                                       "滚出一本书到$N怀中。\n",
                                       this_player());
                        book = new("/clone/book/kuihua");
                        book->move(me);
                        return 1;
                }
                message_vision("$N轻轻地挪动袈裟，抖起一些尘土，呛"
                               "得$N直打喷嚏。\n", this_player());
                return 1;
        } else
        {
                message_vision("$N轻轻地挪动袈裟，突然从袈裟的窟"
                               "窿中冒出一股毒气，钻进$N的鼻子中。\n",
                               this_player());
                me->die();
                return 1;
        }
}
