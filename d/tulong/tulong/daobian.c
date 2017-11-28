inherit ROOM;

void create()
{
        set("short","王盘山岛边");
        set("long", @LONG
王盘山在钱塘江口的东海之中，是个荒凉小岛，山石嶙峋，向无人居。岸边
两人各举大旗，挥舞示意，只见两面大旗上均绣着一头大鹰，双翅伸展，甚是威
武。两面大旗之间站着一个老者。王盘山是个小岛，山石树木无可观之处。东南
角有个港湾，桅樯高耸，停泊着十来艘大船，想是巨鲸帮、海沙派一干人的座船。
LONG );
        set("exits",([
                "southdown":"/d/tulong/tulong/boat2",
                "east":"/d/tulong/tulong/gukou",
            ]));

        set("objects",([
                 "/d/tulong/tulong/npc/jiaozhong1": 2,
                 "/d/tulong/tulong/npc/jiaozhong2": 2,
                 "/d/tulong/tulong/npc/bai": 1,
            ]));

setup();
}

int valid_leave(object me,string dir)
{
        object ob;
        if (!me->query_temp("dao") && dir=="east")
        return notify_fail("一进了会场就是生死之斗，还是先砸了他们的船(break boat)以防不测。\n");

        if (me->query_temp("dao") && dir=="east" && ob=present("bai guishou"))
        {
        ob->ccommand("tnnd"+me->query("id"));
        ob->ccommand("slap3"+me->query("id"));
        message_vision("$N喝道：$n，去死吧！\n",ob,me);
        ob->kill_ob(me);
        ob=present("jiao zhong");
        if (objectp(ob)) ob->kill_ob(me);
        ob=present("jiao zhong 2");
        if (objectp(ob)) ob->kill_ob(me);
        ob=present("jiao zhong 3");
        if (objectp(ob)) ob->kill_ob(me);
        ob=present("jiao zhong 4");
        if (objectp(ob)) ob->kill_ob(me);
        return notify_fail("向东的路被白龟寿拦住了。\n"); }
        return 1;
}

