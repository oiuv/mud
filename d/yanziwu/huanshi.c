//ROOM: /d/yanziwu/huanshi.c

inherit ROOM;
#include <ansi.h>

// 演练参合指必须的三种少林指法
#define MIJI1 "/clone/lonely/book/tianzhuzhi"
#define MIJI2 "/clone/lonely/book/duoluoyezhi"
#define MIJI3 "/clone/lonely/book/xiuluozhi"

string* books = ({ MIJI1, MIJI2, MIJI3 });

int can_creat_book = 0, ran;

void create()
{
        set("short", "还施水阁");
        set("long",@LONG
阁中满是书架(jia)， 架上摆着许多颇古旧的书籍，架上
均贴有标签(sign)。这就是慕容世家历经数代才收集积累而成
的武学宝库。
LONG );
        set("exits", ([
            "out": __DIR__"lanyue",
        ]));
        set("objects", ([
            "/clone/book/book-bamboo": random(2),
            "/clone/book/book-iron": random(2),
            "/clone/book/book-paper": random(2),
            "/clone/book/book-silk": random(2),
            "/clone/book/book-stone": random(2),
        ]));
        
        set("item_desc",([
            "sign" : HIR "缺大理段氏六脉神剑，丐帮降龙十八掌、打狗棍法…\n" NOR,
              "jia"  : HIC "上面放着各种武学书籍，却发现没什么有价值的秘籍。\n" NOR,
        ]));
        
        // 每次更新时随机选出一种可以产生的秘籍，并等待判断 ...
        ran = random(sizeof(books));

        // 每次更新有1/5的几率可以随机产生出一种秘籍，
        // 则产生特定秘籍的几率为1/15，并等待判断 ...
        if (random(5) == 0)can_creat_book = 1;

        setup();

}

void init()
{
        add_action("do_move", "move");      
}

int do_move(string arg)
{       
        object me, book, here;

        me = this_player();
        
        if (! arg || arg != "jia")
                 return notify_fail("你要干什么？\n");
     
        if (! book = find_object(books[ran]))
                  book = load_object(books[ran]);

        if (! here = find_object(__FILE__))
                  here = load_object(__FILE__);

        // 更新前已有人取得过秘籍，只有更新后才可能第二次产生秘籍
        if (here->query("marks/move") || ! can_creat_book)
                  return notify_fail(HIC "你轻轻地将书架推了开，但什么也没发现。\n" NOR);

        message_vision(HIC "$N" HIC "轻轻地将书架推了开…\n" NOR, me);

        if (! environment(book))
        {     
                  tell_object(me, HIY "啪~~地一声，一本书掉在了地上，你赶紧将它收了"
                              "起来。\n" NOR);
     
                  book->move(me);
     
                  here->set("marks/move", 1);
        }
        else return notify_fail(HIG "结果你什么都没发现！\n");

        return 1;
}

// 保证只有每次更新后才会有机会出现秘籍
void reset()
{
       object here;

       ::reset();

       if (! here = find_object(__FILE__))
                 here = load_object(__FILE__);       

       if (here->query("marks/move"))
                 here->delete("marks/move");

}

