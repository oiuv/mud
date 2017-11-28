//Room: ssyb.c 舍身崖壁

inherit ROOM;

#include <ansi.h>

void create()
{
      set("short","舍身崖壁");
      set("long", @LONG
你终于游到崖壁。抬头上望，微见天光。壁面潮湿，裂缝中微有水渗
出。脚下是污浊的臭水，旁边不远出有一个坟墓(fenmu)， 向东就是你来
时的水潭。
LONG);
      set("outdoors", "emei");
      set("objects", ([
          __DIR__"npc/frog" : 1 + random(3),
      ]) );

         set("exits",  ([
                 "east" : __DIR__"st0",
         ]));
      set("item_desc", ([
            "fenmu" : NOR + WHT "看来这个坟墓已经在这里很久了，上面已长满了青苔，令人一看不禁"
                      "沧然之意顿生。\n" NOR,
      ]));
      set("no_clean_up", 0);
      set("no_fight", 1);
      setup();
}

void init()
{
    add_action("do_climb", "climb");
    add_action("do_bai", "bai");
}

int do_climb()
{
    object me;
    me = this_player();
    message("vision", me->name()+"使劲爬上去，花了九牛二虎之力。\n", environment(me), ({me}) );
    me->move(__DIR__"gudelin1");
    message("vision", me->name()+"花了九牛二虎之力，到了这个地方，却不知道在哪里？\n", environment(me), ({me}) );

    return 1;
}

int do_bai(string arg)
{
     object book;

                 object me = this_player();
     if (! arg || arg != "fenmu")
            return 0;
     if (me->is_busy() || me->is_fighting())
     {
            write("你忙完了再说吧！\n");
            return 1;
     }
     if (me->query("jing") < 130)
     {
            write("你精力不足！\n");
            return 1;
     }
     if (me->query("jing") > 200)me->add("jing", -120);
     else me->set("jing", 1);

     write(HIG "你心中沧然之意油然而生 ……\n" NOR);
     write(HIG "你走向坟墓，抹去上面的青苔，跪在地上磕了三个头。\n" NOR);
     me->start_busy(2 + random(2));
     if (this_player()->query_skill("shaolin-jiuyang", 1) < 180
        || this_player()->query_skill("wudang-jiuyang", 1) < 180)
     {
             write(HIG "你忽然觉得深潭底寒冷无比，心想还是赶快离开为好。\n" NOR);
             return 1;      
     }

    // if (random(500) != 1)
     if (random(250) != 1)
     {
             write(HIG "磕头完毕，你缓缓站起身来。默默地注视着坟墓，不禁思绪万千。\n" NOR);
             return 1;
     }

     write(HIG "猛然间你觉得一个硬硬的东西碰在头上，于是你猛地挖开坟墓 ……\n" NOR);
     write(HIG "一个木盒出现在你眼前，你赶忙打开木盒，「嗖」地一声！一枚暗器从中飞出……\n" NOR);
     if (this_player()->query_skill("dodge", 1) < 220 || 
         this_player()->query_skill("martial-cognize", 1) < 220)
     {
          write(HIG "你闪躲不及，暗器从你胸口穿过！\n" NOR);
          this_player()->unconcious();
     }
     write(HIG "你早在打开盒子之前就已料到其中定藏有暗器，所以你从容不迫地躲了过去！\n" NOR);
     if (! book = find_object("/clone/lonely/book/emeijy-book"))
           book = load_object("/clone/lonely/book/emeijy-book");
     if (environment(book))
     {
          write(HIG "你回头一看，却发现盒子是空的！\n" NOR);
          return 1;
     }
     write(HIG "你赶忙将盒子里的东西拿了出来。\n" NOR);
     book->move(this_player());
     return 1;
                  
}
