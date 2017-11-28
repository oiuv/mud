#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "听雨居");
        set("long", @LONG
这个小居建在湖上，看上去没有什么特别之处。四面为水，
湖上烟波尽收眼底。唯一奇怪的是这儿放着一具瑶琴(qin)。
LONG );
        set("item_desc", ([
            "qin" :  "这琴比之寻常七弦琴短了尺许，却有九根琴弦。\n"
                     "不知是该去弹一弹(tan)还是将它击开(break)。\n",
        ]));
        set("exits", ([
            "south" : __DIR__"xiaoqiao",
        ]));
        setup();
}


void init()
{
    add_action("do_tan", "tan");
    add_action("do_tan","play");
    add_action("do_break","break");
}

int do_tan (string arg)
{
    object room;
    object ob = this_player();
    if (! arg || arg != "qin")
		return notify_fail("你要弹什么？\n");

    message_vision("$N轻轻的在琴上一拨，铛的一声，声音颇为宏亮。\n\n" +
                   "似乎这琴有点古怪.....\n" +
                   "$N正纳闷间，忽觉脚底一虚，身子往下直沉.....\n", ob);
    tell_object(ob, "\n你忍不住啊哟一声，便掉入了一个软绵绵的所在！原来是"
		"一艘小船。\n\n" ) ;
    room = load_object("d/yanziwu/hu");
    ob->move(room) ;

    call_out("mantuo", 10, ob);
    return 1;
}

int do_break(string arg)
{
        if (! arg || arg != "qin")
		return notify_fail("你要击开什么？\n");

        message_vision("\n$N一掌击开瑶琴，只听“唰”的一声，突然银光一闪，\n"+
                "一枚梅花镖倏的射出,“噗”的一声射入了$N的人中穴。\n",
		this_player());

        if ((int)this_player()->query("qi") < 200)
		this_player()->die();
        else
		this_player()->unconcious();
        return 1;
}

void mantuo(object ob)
{
	if (! objectp(ob))
		return;

        tell_object(ob, "船来到了一个不知名的地方，你下得船来，"
                    "茫然的看看四周，不知所处。\n");
        ob->move(__DIR__"hupan");
        return;
}

