// pet.c 宠物

#include <ansi.h>
#include <command.h>

#define RIDE_CMD              "/cmds/std/ride"
#define UNRIDE_CMD            "/cmds/std/unride"

inherit NPC;
inherit F_NOCLONE;
inherit F_OBSAVE;
inherit F_UNIQUE;

int is_pet() { return 1; }

int is_stay_in_room() { return 1; }

void create()
{
        set_name("宠物", ({ "pet" }) );
        set("race", "野兽");
        set("gender", "雄性");
        set("age", 2 + random(3));
        set("long", "玩家可以骑上它去指定的地方(rideto)。\n");	
        set("ridable", 1);
        set("no_sell", 1);
        set("no_put", 1);
        
        set("int", 30);
        set("qi", 300);
        set("max_qi", 300);
        set("jing", 100);
        set("max_jing", 100);
        set("shen_type", 0);
        set("combat_exp",50000);
        set("attitude", "peaceful");        
        set("limbs", ({ "头部", "腹部", "尾巴","后腿","前腿" }) );
        set("verbs", ({ "bite", "hoof" }) );

        set_temp("apply/attack", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/defence",100);
        set_temp("apply/armor", 100);
        
        set_temp("owner_id", "lonely");
        
        if (! check_clone()) return 0;

        setup();
        ::restore();
}

int receive_whistle(object me)
{
        object env;
        int    period; 

        if ((env = environment()) && env == me)
        {
                        write(name() + "你不是正骑着吗？你召唤个什么劲？\n");
                return 1;
        }
        if (env == environment(me))
        {
                if (is_fighting())
                        remove_all_enemy(1);                                     
                message_vision(name() + "一闪就不见了。\n", me);
                period = time() - ((int) query("last_save"));
                if (period < 0 || period > 900)
                {
                        set("last_save", time());
                        save(); 
                }
                destruct(this_object());
                return 1;
        } else
        {
                if (env)
                {

                        if (interactive(env = environment()))
                        {
                                env->delete_temp("is_riding"); 
                                delete_temp("is_rided_by");
                                tell_object(env, HIM + name() +
                                        HIM "忽然离你而去了！\n" NOR);
                        }
                }
                message_vision(HIG "$n" HIG "不知从哪里窜到$N" HIG "面前！\n\n" NOR,
                        me, this_object());
        }
        
        move(environment(me));

        if (environment() != environment(me))
                return 0;
RIDE_CMD->main(me, query("id"));
        return 1;
}




// 接受存盘数据的接口函数
int receive_dbase_data(mixed data)
{
        if (! mapp(data))
                return 0;

       
        if (intp(data["ridable"]))
                set("ridable", 1);
        
         

        if (stringp(data["owner"]))
                set("owner", data["owner"]);
                
        return 1;
}

// 进行保存数据的接口函数
mixed save_dbase_data()
{
        mapping data;
        //object  user;

        data = ([ ]);
        
        

        if (intp(data["ridable"]))
                data += ([ "ridable" : query("ridable") ]);
                
               

        if (stringp(data["owner"]))
                data += ([ "owner" : query("owner") ]);  
                
        return data;
}
