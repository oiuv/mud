/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-28 14:11:38
 * @LastEditTime: 2022-03-28 14:15:27
 * @LastEditors: 雪风
 * @Description: 标准生物对象接口，所有生物对象继承使用
 *  https://bbs.mud.ren
 */

inherit CORE_ACTION;
inherit CORE_ATTACK;
inherit CORE_COMMAND;
inherit CORE_CONDITION;
inherit CORE_DBASE;
inherit CORE_MESSAGE;
inherit CORE_MOVE;
inherit CORE_NAME;
inherit CORE_SAVE;
inherit CORE_TEAM;

int is_living() { return query_temp("living"); }
