//ROOM: /d/yanziwu/lanyue.c

inherit ROOM;
#include <ansi.h>

int check_pass(object me);
int end_whisper(object me);

void create()
{
        set("short", "揽月居");
        set("long",@LONG
这是慕容公子的卧室，房中陈设普通，收拾得颇为整洁，
屋角一架茂兰盆景(penjing)长得很是旺盛。晚上月光从窗户射
进来，满室银光，是燕子坞的一大美景。
LONG );
        set("exits", ([
            "west": __DIR__"shuwu",
        ]));

        set("item_desc", ([
            "penjing" : HIW "这盆景似乎很平常，独有其边沿特别光滑。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_knock","knock");
        add_action("do_say","whisper");
}

int do_knock(string arg)
{
        object me;
        me=this_player();

        if (!arg || (arg!="penjing" ) )
                 return  notify_fail("你要敲什么？\n");

        if (me->query_temp("marks/pen")) 
                 return notify_fail("别敲了！\n");

        me->set_temp("marks/pen",1);
        write(HIC "你在盆景上敲了几下...\n" NOR, me);
        remove_call_out("check_pass");
        call_out("check_pass", 4, me);

        return 1;
}

int check_pass(object me)
{
       write(HIC "不一会儿，只听不远处隐约传来一阵说话声：“洒国梦语…”\n" NOR);
       write(HIY "你想了想，觉得像是一句暗语，你很想回答(whisper)但又不知道说些什么！\n" NOR);
       me->set_temp("can_whisper", 1);
       remove_call_out("end_whisper");
       call_out("end_whisper", 9, me);
       return 1;
}

int end_whisper(object me)
{
      write(HIM "过了良久，只听见一阵不耐烦的声音传来：“算了，没事别在这来捣乱。”\n" NOR);
      me->delete_temp("marks/pen");
      me->delete_temp("can_whisper");
      return 1;
}

int do_say(string arg)
{
     object me = this_player();
     
     if (! arg || ! me->query_temp("can_whisper"))
              return notify_fail("你自言自语不知道在说什么！\n");

     if(arg != "光复大燕")
     {
              write(HIG "你悄悄地说道：“" + arg + "”，却没什么反应。\n");
              return 1;
     }
 
     write(HIG "你悄悄地说道：“光复大燕”……\n" NOR);
     write(HIC "里面的人笑了笑说道：“既然是主人的吩咐，那你就进来吧！”\n");
     write(HIY "忽然，轰轰几声过后，花盆后露出一条路来，你赶忙顺着走了下去……\n");
     me->move(__DIR__"huanshi");
     me->delete_temp("can_whisper");
     return 1;

}



