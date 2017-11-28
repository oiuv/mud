inherit ROOM;

void create()
{
        set("short", "青草坪");
        set("long", @LONG
这里是树林中的一片比较大的空地，名曰：青草坪。因为
处于密林之中所以这里平时很少有人来，但是不知道为什么今
天这里却有不少人。你看，又一个来了。
LONG );
	set("exits", ([
		"north" : __DIR__"xiaodao3",
		"south" : __DIR__"xiaodao5",
		"east"  : __DIR__"xiaodao4",
		"west"  : __DIR__"xiaodao1",
                "enter" : __DIR__"midao",
	]));
	set("outdoors", "xiaoyao");
	set("objects", ([
		CLASS_D("xiaoyao") + "/suxingh" : 1,
                CLASS_D("duan") + "/duanyq" : 1,
                CLASS_D("duan") + "/duanyu" : 1,
                __DIR__"npc/wangyuyan" : 1,
	]));
        set("zhenlong", 1);
	set("valid_startroom", 1);
	setup();
	"/clone/board/xiaoyao_b"->foo();
}

int valid_leave(object me, string dir)
{
        object su;

        if (dir != "enter")
                return ::valid_leave(me, dir);

        if (! (su = present("su xinghe", this_object())) || ! living(su))
                return ::valid_leave(me, dir);

        if (! su->permit_pass(me, dir))
                return 0;

        return ::valid_leave(me, dir);
}

string long()
{
        string msg;
//      int i;

        if (query("zhenlong"))
        {
                msg = "    空地中间摆了一副棋盘，上面放了不少的子。一"
                      "旁围着不少的人在观看，有的冥神思索，有的看似漫"
                      "不经心。";
        } else
                msg = "    ";
        if (present("duan yanqing", this_object()))
        {
                msg += "旁边一怪客一袭青衫、容貌丑陋，冷酷异常，冷冷"
                       "的看着" + (query("zhenlong") ? "棋盘。" : "众人。");
        }
        if (present("duan yu", this_object()))
        {
                if (present("wang yuyan", this_object()))
                        msg += "有一人最是奇特，长得风度翩翩，颇具"
                               "富贵气相，却总是瞅着身旁一女子，色迷"
                               "迷的样子真是让人心中窃笑。";
                else
                        msg += "有一人却是失魂落魄，六神无主，仿佛"
                               "不见了什么重要东西似的。";
        }

        return query("long") + sort_string(msg, 54);
}