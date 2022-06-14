/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: attack.c
Description: 战斗攻击功能接口 ATTACK
Author: xuefeng
Version: v1.0
*****************************************************************************/
#include <ansi.h>
#include <dbase.h>

#ifndef MAX_OPPONENT
#define MAX_OPPONENT    5
#endif

nosave object *enemies = ({});

object *query_enemy() { return enemies; }

varargs int is_fighting(object ob)
{
    if (!ob)
        return sizeof(enemies) > 0;

    return member_array(ob, enemies) != -1;
}

void fight_ob(object ob)
{
    if(!ob || ob==this_object()) return;

    if (member_array(ob, enemies) == -1)
    {
        enemies += ({ob});
    }
}

void kill_ob(object ob)
{
    int enemy = sizeof(ob->query_enemy());
    object me = this_object(), *tm = ob->query_team();

    if (member_array(ob, enemies) == -1)
    {
        if (interactive(ob) && !arrayp(tm) && enemy >= min(({1 + ob->query("lv") / 3, MAX_OPPONENT})))
        {
            /* 单独玩家最多可以被 MAX_OPPONENT 个 MOB 围攻 */
        }
        else if (interactive(ob) && arrayp(tm) && enemy >= min(({1 + tm[0]->query("lv") / 3, MAX_OPPONENT * 3})))
        {
            /* 组队玩家最多可以被 3 * MAX_OPPONENT 个MOB围攻 */
        }
        else
        {
            if (interactive(ob) && environment(ob) == environment())
            {
                // 这里可能造成信息提前显示的问题
                tell_object(ob, HIR "看起来" + me->name() + HIR "想杀死你！\n" NOR);
            }
            enemies += ({ob});
            ob->fight_ob(this_object());
        }
    }
}

void kill_ob_team(object ob)
{
    object *team = ob->query_team();
    if (!arrayp(team))
    {
        kill_ob(ob);
        return;
    }

    foreach(object enemy in team)
    {
        kill_ob(enemy);
    }
}

void clean_up_enemy()
{
    int i;

    if (i = sizeof(enemies))
    {
        while (i--)
        {
            if (!objectp(enemies[i]) || environment(enemies[i]) != environment())
            {
                enemies[i] = 0;
            }
        }
        enemies -= ({0});
    }
}

int remove_enemy(object ob)
{
    enemies -= ({ob});
    return 1;
}

void remove_all_enemy()
{
    enemies = ({});
}

void attack()
{
    object opponent;

    clean_up_enemy();
    if (sizeof(enemies) && objectp(opponent = element_of(enemies)))
    {
        set_temp("last_opponent", opponent);
        COMBAT_D->fight(this_object(), opponent);
        return;
    }
    else
    {
        // todo 设置玩家的自动战斗模式
    }
}

// 获取敌人分组
mixed enemy_teams()
{
    clean_up_enemy();
    return unique_array(enemies, (: base_name($1) :));
}

// 获取第一个敌人最多的分组
object *enemy_team()
{
    mixed team = enemy_teams();
    object *tm;
    int i;

    if (sizeof(team) == 1)
        return team[0];
    if (sizeof(team) > 1)
    {
        for (i = 1; i < sizeof(team); i++)
        {
            tm = sizeof(team[i]) > sizeof(team[i - 1]) ? team[i] : team[i - 1];
        }
        return tm;
    }
    return team;
}

// 自动攻击相关处理，需实现
void init()
{
    // todo
}
