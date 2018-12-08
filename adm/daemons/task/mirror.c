
#include <ansi.h>
#define   TASK_OBJ_PATH  "/adm/daemons/task/obj/"       //task物件目录

inherit ITEM;

void create()
{
        set_name(HIR"乾" HIY"坤" HIW"宝" HIG "镜" NOR,
                   ({ "bao jing", "jing", "mirror"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "这是道门至宝乾坤镜，据说内蕴乾坤，可定位万物。\n"NOR);
                set("unit", "面");
                set("weight", 10);
                set("material", "tian jing");
                set("no_sell", 1);
                set("no_put",  1);
                set("no_store",1);
            //    set("no_give",1);
             }
        setup();
}

void init()
{
        add_action("do_locate", "locate");
        add_action("do_locate", "mirror");
        add_action("do_task",   "task");
        add_action("do_task",   "listtask");
}

int do_locate( string arg )
{
        //object ob, npc, env, me, room;
        object ob, npc, env, me;
        string msg, *msg_arr, dir_name, dir_total;
        mapping dir;
        int dir_tot_num, x, rank, file, per;

        me = this_player();
        dir_total = "";

    if ( me->is_busy() )
    return notify_fail("你现在正忙，没空使用宝镜！\n");

    if ( query("power") <= 0 )
    return notify_fail("这块乾坤宝镜已经没有灵力了！\n");

    if (!arg)
    return notify_fail("你要定位什么东西？\n");

        if ( file_size( TASK_OBJ_PATH + arg + ".c" ) < 0 )
        return notify_fail(HIR"没有这个TASK物品！\n"NOR);

        ob = find_object(TASK_OBJ_PATH + arg );

        if (! ob)
        return notify_fail(HIC + arg + "这个物品已经物归原主了！\n"NOR);

        npc = environment(ob);

        if (! npc || npc == 0)
        return notify_fail("确定不了" + arg + "的位置。\n");

        if ( npc->is_player() )
        return notify_fail("这个东西现在已经被别人拿了，你别瞎忙了。\n");

        me->start_busy(2);

        if ( ! npc->is_character() )
                {
                        env = npc;
                }
        else
                {
                        env = environment(npc);
                }
        msg = env->long();   //物品所在房间的描述
        per = sizeof(msg)/2 * ( 100 - query("power"))/100;

    dir = env->query("exits");      //物品所在的地方有几个方向

    foreach(dir_name in keys(dir))

        {
               dir_total += " " + dir_name + " ";
               dir_tot_num += 1;
        }


         msg_arr = explode(msg,"\n");

         for (x = 0; x < per; x++)
         {
            rank = random(sizeof(msg_arr));

            file = random( strlen(msg_arr[rank])/2 ) * 2;

            msg = replace_string( msg, msg_arr[rank][file..(file+1)],
                  HIG"[]"NOR,1);

         }

        if ( ! msg || msg == 0)
        return notify_fail("确定不了" + arg + "的位置。\n");

           tell_object(me, WHT "乾坤宝镜显示" NOR + ob->name() + NOR
                       WHT"现在所在地方的描述是:\n\n" NOR + msg + "\n" +
                         "这个地方的出口有"HIG + dir_total + NOR"。\n");

       this_object()->add("power",-(random(3) + 3));
       if ( this_object()->query("power") < 0 )
       this_object()->set("power", 0);
       return 1;

}

int do_task( string arg)
{
     if ( ! arg )
     {
         //string msg, msg1, msg2, space, *i_list;
         string msg, msg1, space, *i_list;
         object task;
         int x,len;

         if ( this_player()->is_busy() )
         return notify_fail("你现在正忙，没空使用宝镜！\n");

         i_list = get_dir(TASK_OBJ_PATH);
         msg = "";
         msg1 = "";
         space = "                                                         ";

         msg += "=================================================="
                "====================\n";
         msg += HIG"                         宝镜任务使命榜\n\n"NOR;

         for(x=0; x<sizeof(i_list); x++)
         {
             task = find_object(TASK_OBJ_PATH + i_list[x]);
             if ( ! task)
             {
                task = load_object(TASK_OBJ_PATH + i_list[x]);
                msg1 = task->query("owner") + "的" + task->name() + "(" +
                       task->query("id") + ")";
                len = sizeof(task->query("owner")) + 4 +
                      sizeof(filter_color(task->name())) +
                      sizeof(task->query("id"));
                len = 26 -len;

                msg1 = msg1 + space[0..len] + HIB"(已做)"NOR;

                destruct(task);
             }

            if ( task )
             {
                msg1 = task->query("owner") + "的" + task->name() + "(" +
                       task->query("id") + ")";
                len = sizeof(task->query("owner")) + 4 +
                      sizeof(filter_color(task->name())) +
                      sizeof(task->query("id"));
                len = 26 -len;

                msg1 = msg1 + space[0..len] + HIG"(未做)"NOR;

             }
            if ( x % 2 == 1 )
            {
               msg += msg1 + "\n";
            }
            else
            {
               msg += msg1 + "  ";
            }

         }


        msg += "\n=================================================="
                "====================\n";
        if ( this_player()->query("mirror_count") )
        {
           msg +=   HIY"你累计已完成" +  HIR +
                    chinese_number(this_player()->query("mirror_count")) + NOR
                    + HIY"个宝镜任务。\n"NOR;
        }

        tell_object(this_player(), msg + "\n");
        return 1;
     }

}

string long()
{
        return query("power") ? query("long") + HIW"现在宝镜的灵力为：" +
        query("power") + "\n"NOR: query("long") + HIR"现在宝镜的灵力已经"
        "耗尽了。\n"NOR;
}
