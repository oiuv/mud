#include <ansi.h>

inherit ROOM;

int tell_player();

void create()
{
        set("short", "厢房");
        set("long", @LONG
这是绝情谷主的厢房，平时除了谷主本人外未经允许任何
人都不能入内。但见厢房布置简陋，但四周陈设整齐，靠床的
衣柜上摆着一个外形奇怪的花盆(pen)。
LONG);
        set("item_desc",([
               "pen" : HIC "这个花盆看上去很奇怪，似乎连接着什么机关。\n" NOR,
        ]));

        set("exits", ([
               "east"    : __DIR__"changlang3",
        ]));

        set("no_clean_up", 0);

        setup();
}

void init()
{       
        add_action("do_turn", ({ "turn", "zhuan" }));
        add_action("do_jump", ({ "tiao", "jump" }));
}

int do_turn(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "pen")
                return notify_fail("你要做什么？\n");

        if (! ob = find_object(__DIR__"xiangfang1"))
                ob = load_object(__DIR__"xiangfang1");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        // 机关已经打开，再次转动则关闭
        if (ob->query_temp("marks/转"))
        {
                 message_sort(HIG "\n$N轻轻地转动花盆，一阵巨响从床头传"
                              "出，原来露出的洞口已被完全封住，已经也看"
                              "不出来这下面隐藏的暗道。\n" NOR, me);   

                 set("long",@LONG
这是绝情谷主的厢房，平时除了谷主本人外未经允许任何
人都不能入内。但见厢房布置简陋，但四周陈设整齐，靠床的
衣柜上摆着一个外形奇怪的花盆(pen)。
LONG);

                 ob->delete_temp("marks/转", 1);

                 return 1; 
        }
        // 机关未打开，打开机关
        message_sort(HIY "\n$N轻轻地转动花盆，一阵巨响从床头传出，定睛"
                           "一看，只见床头处露出一个洞口(dong)来，原来"
                           "这里竟隐藏着暗道。\n" NOR, me);

       ob->set_temp("marks/转", 1);

       set("long",@LONG
这是绝情谷主的厢房，平时除了谷主本人外未经允许任何
人都不能入内。但见厢房布置简陋，但四周陈设整齐，床头处
却露出一个洞(dong)来，不知道通往何处。 
LONG);

       return 1;
}

int do_jump(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || (arg != "dong" && arg != "hole"))
                return notify_fail("你要做什么？\n");

        if (! ob = find_object(__DIR__"xiangfang1"))
                ob = load_object(__DIR__"xiangfang1");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");
        
        if (! ob->query_temp("marks/转"))
                return notify_fail("你乱跳什么？");  

        tell_room(ob, me->name() + HIW "纵身一跃，跳进床头的洞口…\n" NOR, me);

        tell_object(me, HIC "\n你纵身一跃，进入洞中，耳边寒风飕飕，此洞深不见底，但觉\n"
                            "足底空虚，竟似直堕了数十丈尚未著地…\n" NOR);

        remove_call_out("tell_player");
        call_out("tell_player", random(4) + 3);

        return 1;
}

int tell_player()
{
       object ob1, ob2;
       object me = this_player();
     
       // ob1 鄂鱼潭岸上
       if (! ob1 = find_object(__DIR__"eyutan1"))
               ob1 = load_object(__DIR__"eyutan1");

       // ob2 鄂鱼潭水中
       if (! ob2 = find_object(__DIR__"eyutan2"))
               ob2 = load_object(__DIR__"eyutan2");

       tell_object(me, HIG "思念未定，扑通一声，你已摔入水中，往下急沉。\n" NOR);

       tell_room(ob1, me->name()+ HIW "\n从上面跳下，坠入潭中。\n" NOR, me);

       me->move(ob2);

       return 1;
}
