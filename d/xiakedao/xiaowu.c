// xiaowu.c 小屋

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里是一个很小的石室，比之外面的任何一个都要小很多，室中
放着一些乱七八遭的家具，墙角边还有一张破烂的小床(bed) ，石室
内满是灰尘，已经好久没人来过了，你是不是走错地方了呀。
LONG );
        set("exits", ([
              "north" : __DIR__"shibi",
        ]));
        set("item_desc", ([
              "bed" : "一张舒适得让人立马想睡的小床。\n"
        ]));
        setup();
}

void init()
{
        add_action("do_move","move");
}

int do_move(string arg)
{
        object me;

        me = this_player();
        if (arg != "bed") return 0;
        message_vision("$N用力把小床移开，发现里面竟然有一条秘密通道！\n", me);
        me->move(__DIR__"midao1");
        tell_object(me, "接着是一阵轰隆隆的响声，你定神一看，自己已经处身在秘密通道中了。\n");
        return 1;
}
