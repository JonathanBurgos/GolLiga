import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Copa Aficionados' }) @IsString() @MinLength(3) @MaxLength(100) name!: string;
  @ApiProperty({ example: 2026 }) @IsInt() @Min(2000) @Max(2100) season!: number;
  @ApiProperty({ example: 'Fútbol 11' }) @IsString() @MinLength(2) @MaxLength(80) competition!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
export class UpdateTournamentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @MaxLength(100) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(2000) @Max(2100) season?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(80) competition?: string;
  @ApiPropertyOptional({ enum: ['DRAFT', 'UPCOMING', 'ACTIVE', 'FINISHED'] }) @IsOptional() @IsIn(['DRAFT', 'UPCOMING', 'ACTIVE', 'FINISHED']) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
export class UpdateTournamentRulesDto {
  @ApiProperty({ minimum: 0, maximum: 10 }) @IsInt() @Min(0) @Max(10) victoryPoints!: number;
  @ApiProperty({ minimum: 0, maximum: 10 }) @IsInt() @Min(0) @Max(10) drawPoints!: number;
  @ApiProperty({ minimum: 0, maximum: 10 }) @IsInt() @Min(0) @Max(10) defeatPoints!: number;
  @ApiProperty({ type: [String], enum: ['goalDifference', 'goalsFor', 'headToHead', 'fairPlay', 'lottery'] }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5) @ArrayUnique() @IsIn(['goalDifference', 'goalsFor', 'headToHead', 'fairPlay', 'lottery'], { each: true }) tieBreakCriteria!: string[];
  @ApiProperty({ enum: ['GROUPS_PLAYOFFS', 'LEAGUE', 'KNOCKOUT'] }) @IsIn(['GROUPS_PLAYOFFS', 'LEAGUE', 'KNOCKOUT']) competitionFormat!: string;
  @ApiProperty({ minimum: 1, maximum: 64 }) @IsInt() @Min(1) @Max(64) groupCount!: number;
  @ApiProperty({ minimum: 1, maximum: 32 }) @IsInt() @Min(1) @Max(32) qualifiersPerGroup!: number;
  @ApiProperty({ minimum: 1, maximum: 20 }) @IsInt() @Min(1) @Max(20) yellowCardsForSuspension!: number;
  @ApiProperty({ minimum: 1, maximum: 20 }) @IsInt() @Min(1) @Max(20) directRedSuspensionMatches!: number;
  @ApiProperty({ minimum: 1, maximum: 20 }) @IsInt() @Min(1) @Max(20) secondYellowSuspensionMatches!: number;
  @ApiProperty() @IsBoolean() resetCardsAtPlayoffs!: boolean;
  @ApiProperty({ minimum: 0, maximum: 20 }) @IsInt() @Min(0) @Max(20) yellowCardPoints!: number;
  @ApiProperty({ minimum: 0, maximum: 20 }) @IsInt() @Min(0) @Max(20) secondYellowPoints!: number;
  @ApiProperty({ minimum: 0, maximum: 20 }) @IsInt() @Min(0) @Max(20) directRedPoints!: number;
  @ApiProperty() @IsString() @MaxLength(250) otherSanctions!: string;
  @ApiProperty() @IsString() @MaxLength(80) timeZone!: string;
  @ApiProperty() @IsString() @Matches(/^[A-Z]{3}$/) currency!: string;
  @ApiProperty({ minimum: 0, maximum: 1000000000 }) @IsInt() @Min(0) @Max(1000000000) registrationFee!: number;
  @ApiProperty() @IsString() @MaxLength(150) organizationContact!: string;
}
export class CreateTeamDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @ApiProperty({ example: 'LEO' }) @IsString() @MinLength(2) @MaxLength(5) shortName!: string;
  @ApiProperty({ example: 'Grupo A' }) @IsString() @MinLength(1) @MaxLength(40) groupName!: string;
  @ApiPropertyOptional({ description: 'URL del escudo almacenado en Cloudinary.' }) @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(2048) crestUrl?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^#[\da-fA-F]{6}$/) primaryColor?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^#[\da-fA-F]{6}$/) secondaryColor?: string;
  @ApiPropertyOptional({ enum: ['PENDING', 'CONFIRMED'] }) @IsOptional() @IsIn(['PENDING', 'CONFIRMED']) enrollmentStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) delegateName?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^\+?[\d\s()-]{7,18}$/) delegatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(120) delegateEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() registeredAt?: string;
}
export class UpdateTeamDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(5) shortName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(40) groupName?: string;
  @ApiPropertyOptional({ description: 'URL del escudo almacenado en Cloudinary.' }) @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(2048) crestUrl?: string;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] }) @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^#[\da-fA-F]{6}$/) primaryColor?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^#[\da-fA-F]{6}$/) secondaryColor?: string;
  @ApiPropertyOptional({ enum: ['PENDING', 'CONFIRMED'] }) @IsOptional() @IsIn(['PENDING', 'CONFIRMED']) enrollmentStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) delegateName?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^\+?[\d\s()-]{7,18}$/) delegatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(120) delegateEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() registeredAt?: string;
}
export class CreatePlayerDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty({ minimum: 1, maximum: 99 }) @IsInt() @Min(1) @Max(99) jerseyNumber!: number;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(50) position!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_protocol: true }) avatarUrl?: string;
}
export class UpdatePlayerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 99 }) @IsOptional() @IsInt() @Min(1) @Max(99) jerseyNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(50) position?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_protocol: true }) avatarUrl?: string;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] }) @IsOptional() @IsIn(['ACTIVE', 'INACTIVE']) status?: string;
}
export class CreateMatchDto {
  @ApiProperty() @IsString() homeTeamId!: string;
  @ApiProperty() @IsString() awayTeamId!: string;
  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) round!: number;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(40) groupName!: string;
  @ApiProperty() @IsDateString() scheduledAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) venue?: string;
}
export class UpdateMatchDto {
  @ApiPropertyOptional() @IsOptional() @IsString() homeTeamId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() awayTeamId?: string;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @IsInt() @Min(1) round?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(40) groupName?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) venue?: string;
}
export class CreateMatchEventDto {
  @ApiProperty() @IsString() teamId!: string;
  @ApiProperty() @IsString() playerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedPlayerId?: string;
  @ApiProperty({ enum: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'FOUL', 'SUBSTITUTION', 'SANCTION'] })
  @IsEnum(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'FOUL', 'SUBSTITUTION', 'SANCTION']) type!: string;
  @ApiProperty({ minimum: 0, maximum: 150 }) @IsInt() @Min(0) @Max(150) minute!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) details?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 20 }) @IsOptional() @IsInt() @Min(1) @Max(20) suspensionMatches?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() suspensionFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() suspensionTo?: string;
}
