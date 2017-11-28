// Room: /d/shaolin/putiyuan.c
// by Doing Lu 10/10/2K

// 迷题：取易筋经
// 掀“一梦如是”
// xian 一
// xian 梦
// xian 如 3 (因为如有多个，掀第三个)
// xian 是
// 然后look hole可以看到书，get book from hole即可。

#define MIJI            "/clone/book/yijinjing"

inherit ROOM;

string look_hole();
string look_jing();
int do_xian(string arg);
int do_get(string arg);
void close_hole();

void create()
{
	set("short", "菩提院");

	set("long", @LONG
这里是少林寺的菩提院。殿上并列这三尊铜像，佛像之前安
着一座屏风，屏风上装着一面极大的铜镜，擦得晶光净亮，镜中
将你的人影照了出来，铜镜(jing)上镌着四句经偈，佛像前点着
几盏油灯，昏黄的灯光之下，依稀看到的是：“一切有为法，如
梦幻泡影，如露亦如电，当作如是观。”
LONG );
	set("exits", ([
		"southdown" : __DIR__"guangchang4",
	]));

        set("item_desc", ([
                "铜镜" : (: look_jing :),
                "jing" : (: look_jing :),
                "hole" : (: look_hole :)
        ]));

        set("objects", ([
                CLASS_D("shaolin") + "/xuan-ji" : 1
        ]));

	set("valid_startroom", 1);
	set("book_count", 1);
        set("status", 0);
	setup();
}

void init()
{
        add_action("do_get", "get");
        add_action("do_xian", "xian");
}

string look_jing()
{
        object me;

        me = this_player();
        if (me->query("score") < 1000)
                return "你看了半天，只看到自己的影子，没发现什么。\n";

        if (me->query("score") < 5000)
                return "你觉得上面镌的经偈似乎有些不同。\n";

        return "你发现上面镌的经偈光泽和别处不一样，难道可以掀(xian)开？\n";
}

string look_hole()
{
//      string msg;

        if (query("status") != 4)
                return "哪里有什么洞？抓老鼠么？\n";

        if (query("book_count"))
                return "这是铜镜下面的一个小洞，里面放着一本残破的旧经书(book)。\n";

        return "这是铜镜下面的一个小洞，里面空空如也，什么也没有。\n";
}

int do_xian(string arg)
{
        int n;
        int right;
        object ob;

        if (! arg)
                return notify_fail("你要掀什么字？\n");

        if (objectp(ob = present("xuanji dashi", this_object())) &&
            living(ob))
                return notify_fail("玄寂一眼扫了过来，冷冰冰"
                                   "的似要将你看穿，你哪敢乱动？\n");

        if (arg == "如")
                return notify_fail("你要掀哪一个如？\n");

        if (sscanf(arg, "%s %d", arg, n) != 2) n = 1;
        if (sizeof(arg) != 2)
                return notify_fail("经偈中没有这个字呀！\n");

        if (strsrch("一切有为法如梦幻泡影如露亦如电当作如是观", arg) == -1)
                return notify_fail("经偈中没有这个字呀！\n");

        if (arg != "如" && n != 1 || n > 4)
                return notify_fail("经偈中没有这没多的“" +
                                   arg + "”字呀！\n");

        message_vision("$N掀了一下" + (n > 1 ? "第" + chinese_number(n) + "个" : "") +
                       "“" + arg + "”字。\n", this_player());

        right = 0;
        switch (query("status"))
        {
        case 1:
                if (arg == "梦") right = 2;
                break;
        case 2:
                if (arg == "如" && n == 3) right = 3;
                break;
        case 3:
                if (arg == "是") right = 4;
                break;
        }

        // 只要掀“一”就还原
        if (arg == "一") right = 1;
        set("status", right);
        message("vision", "你听到“咔啦”一声响声，似乎"
                          "有什么机关触动了。\n", this_object());
        if (right == 4)
        {
                message_vision("$N的手指还没有离开镜面，只听得轧轧声响，铜镜已"
                               "经缓缓翻起，露出一个小洞(hole)。\n",
                               this_player());
                call_out("close_hole", 8);
        }
        return 1;
}

int do_get(string arg)
{
        object me;
        object ob;

        me = this_player();

        if (! arg)
                return 0;

        if (arg != "book from hole" &&
            arg != "book in hole" &&
            arg != "jing from hole" &&
            arg != "jing in hole")
                return 0;

        if (query("status") != 4)
                return 0;

        // 已经存在秘本，或者书已经被拿走
        if (objectp(ob = find_object(MIJI)) &&
            environment(ob) || query("book_count") < 1)
        {
                write("你想书想晕了头吗？那里并没有什么书呀！\n");
                return 1;
        }

        set("book_count", 0);
        ob = load_object(MIJI);
        if (! objectp(ob))
        {
                write("系统出现故障 - 找不到应该在这里的秘籍了 :)\n");
                return 1;
        }

        message_vision("$N从小洞中将那本经书取出，放进包内。\n", me);
        ob->move(me, 1);
        CHANNEL_D->do_channel(this_object(), "rumor",
                              me->name(1) + "从少林寺窃走一本易筋经。");
        return 1;
}

void close_hole()
{
        set("status", 0);
        message("vision", "一阵轧轧声过后，铜镜又缓缓的落下。\n",
                this_object());
}